import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { AiActionType, Prisma } from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DashboardQuestionDto } from './dto/dashboard-question.dto';
import { GenerateSupportReplyDto } from './dto/generate-support-reply.dto';

@Injectable()
export class AiService {
  private readonly provider = process.env.AI_PROVIDER || 'openai';

  private readonly client = new OpenAI({
    apiKey:
      this.provider === 'openrouter'
        ? process.env.OPENROUTER_API_KEY
        : process.env.OPENAI_API_KEY,
    ...(this.provider === 'openrouter'
      ? {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'FinSight AI',
          },
        }
      : {}),
    timeout: 30_000,
    maxRetries: 0,
  });

  private readonly model =
    this.provider === 'openrouter'
      ? process.env.OPENROUTER_MODEL || 'openrouter/free'
      : process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async summarizeTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        client: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const prompt = `
Summarize this support ticket for an admin.

Return:
1. Issue summary
2. Client concern
3. Current status
4. Important internal notes
5. Recommended next action

Ticket:
Subject: ${ticket.subject}
Status: ${ticket.status}
Priority: ${ticket.priority}
Client: ${ticket.client.user.firstName} ${ticket.client.user.lastName} (${ticket.client.user.email})

Messages:
${ticket.messages
  .map(
    (msg) =>
      `- ${msg.sender.role} ${msg.sender.firstName}: ${msg.message} ${
        msg.isInternal ? '(internal)' : ''
      }`,
  )
  .join('\n')}
`;

    const response = await this.generateText(prompt);

    await this.log({
      userId,
      action: AiActionType.TICKET_SUMMARY,
      prompt,
      response,
      metadata: { ticketId },
    });

    return { summary: response };
  }

  async generateSupportReply(
    ticketId: string,
    userId: string,
    dto: GenerateSupportReplyDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        client: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const prompt = `
Draft a support reply for this ticket.

Rules:
- Be ${dto.tone || 'professional'}.
- Do not promise anything not confirmed in the data.
- Do not mention internal notes.
- Keep it concise.
- Use clear support language.

Extra instruction:
${dto.instruction || 'No extra instruction.'}

Ticket:
Subject: ${ticket.subject}
Status: ${ticket.status}
Priority: ${ticket.priority}
Client: ${ticket.client.user.firstName}

Messages:
${ticket.messages
  .filter((msg) => !msg.isInternal)
  .map((msg) => `- ${msg.sender.role} ${msg.sender.firstName}: ${msg.message}`)
  .join('\n')}
`;

    const response = await this.generateText(prompt);

    await this.log({
      userId,
      action: AiActionType.SUPPORT_REPLY,
      prompt,
      response,
      metadata: { ticketId },
    });

    return { reply: response };
  }

  async summarizeClientRisk(clientId: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        tickets: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
          include: { messages: true },
        },
        kycDocuments: true,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    const prompt = `
Analyze this fintech client and produce a risk summary.

Return:
1. Risk level: LOW / MEDIUM / HIGH
2. Reasons
3. KYC concerns
4. Transaction concerns
5. Support history concerns
6. Recommended next action

Important:
- This is an internal assistant summary.
- Do not make legal conclusions.
- Only infer from provided data.

Client:
Name: ${client.user.firstName} ${client.user.lastName}
Email: ${client.user.email}
Client status: ${client.status}
KYC status: ${client.kycStatus}
Country: ${client.country || '-'}

KYC documents:
${client.kycDocuments
  .map((doc) => `- ${doc.type}: ${doc.status} ${doc.rejectionReason || ''}`)
  .join('\n')}

Recent transactions:
${client.transactions
  .map(
    (tx) =>
      `- ${tx.type} ${tx.currency} ${tx.amount} ${tx.status} ${
        tx.rejectionReason || ''
      }`,
  )
  .join('\n')}

Recent tickets:
${client.tickets
  .map(
    (ticket) =>
      `- ${ticket.subject} | ${ticket.status} | ${ticket.priority} | messages: ${ticket.messages.length}`,
  )
  .join('\n')}
`;

    const response = await this.generateText(prompt);

    await this.log({
      userId,
      action: AiActionType.CLIENT_RISK_SUMMARY,
      prompt,
      response,
      metadata: { clientId },
    });

    return { riskSummary: response };
  }

  async askDashboardQuestion(userId: string, dto: DashboardQuestionDto) {
    const [clients, transactions, tickets, kycPending] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.transaction.groupBy({
        by: ['status', 'type'],
        _count: true,
      }),
      this.prisma.supportTicket.groupBy({
        by: ['status', 'priority'],
        _count: true,
      }),
      this.prisma.client.count({
        where: { kycStatus: 'PENDING' },
      }),
    ]);

    const prompt = `
Answer the admin's dashboard question using only the provided data.

If the question requires data not provided, say what data is missing.

Question:
${dto.question}

Dashboard data:
Total clients: ${clients}
Pending KYC clients: ${kycPending}

Transaction aggregates:
${transactions
  .map((item) => `- ${item.type} ${item.status}: ${item._count}`)
  .join('\n')}

Ticket aggregates:
${tickets
  .map((item) => `- ${item.status} ${item.priority}: ${item._count}`)
  .join('\n')}
`;

    const response = await this.generateText(prompt);

    await this.log({
      userId,
      action: AiActionType.DASHBOARD_QA,
      prompt,
      response,
      metadata: { question: dto.question },
    });

    return { answer: response };
  }

  async getMyLogs(userId: string) {
    return await this.prisma.aiLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private async generateText(prompt: string): Promise<string> {
    if (!['openai', 'openrouter'].includes(this.provider)) {
      throw new BadGatewayException(
        `Unsupported AI_PROVIDER: ${this.provider}`,
      );
    }

    const apiKey =
      this.provider === 'openrouter'
        ? process.env.OPENROUTER_API_KEY
        : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const keyName =
        this.provider === 'openrouter'
          ? 'OPENROUTER_API_KEY'
          : 'OPENAI_API_KEY';
      throw new BadGatewayException(`${keyName} is missing`);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a careful fintech CRM assistant. Use only the provided data. Do not invent facts. Keep answers structured and concise.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return (
        response.choices[0]?.message?.content?.trim() ||
        'No AI response generated.'
      );
    } catch (error) {
      console.error(`${this.provider} AI error:`, error);

      const providerError =
        error instanceof OpenAI.APIError
          ? ` (${error.status}${error.code ? `: ${error.code}` : ''})`
          : '';

      throw new BadGatewayException(
        `${this.provider} request failed${providerError}. Please try again later.`,
      );
    }
  }

  private async log(payload: {
    userId: string;
    action: AiActionType;
    prompt: string;
    response: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    const data: Prisma.AiLogCreateInput = {
      action: payload.action,
      prompt: payload.prompt,
      response: payload.response,
      user: {
        connect: { id: payload.userId },
      },
      metadata: payload.metadata,
    };

    await this.prisma.aiLog.create({
      data,
    });
  }
}
