import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  NotificationType,
  Prisma,
  TicketStatus,
  UserRole,
} from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { resolveClientIdForActor } from '../../common/auth/client-access.util';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateTicketDto, actor: JwtPayload) {
    const clientId = await resolveClientIdForActor(
      this.prisma,
      actor,
      dto.clientId,
    );

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const ticket = await this.prisma.supportTicket.create({
      data: {
        clientId,
        subject: dto.subject,
        priority: dto.priority,
        assignedToId: dto.assignedToId,
        createdById: actor.sub,
        messages: {
          create: {
            senderId: actor.sub,
            message: dto.message,
          },
        },
      },
      include: this.ticketInclude(),
    });

    if (dto.assignedToId) {
      await this.notifications.create({
        userId: dto.assignedToId,
        type: NotificationType.TICKET_CREATED,
        title: 'New ticket assigned',
        message: dto.subject,
        metadata: { ticketId: ticket.id },
      });
    }

    this.realtime.emitToTicket(ticket.id, 'ticket:created', ticket);

    return ticket;
  }

  async findAll(query: TicketQueryDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.SupportTicketWhereInput = {
      ...(query.clientId && { clientId: query.clientId }),
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        OR: [
          { subject: { contains: query.search, mode: 'insensitive' } },
          {
            client: {
              user: {
                email: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
          {
            client: {
              user: {
                firstName: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
          {
            client: {
              user: {
                lastName: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: this.ticketInclude(false),
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, actor?: JwtPayload) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: this.ticketInclude(),
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (actor?.role === UserRole.CLIENT && ticket.client.userId !== actor.sub) {
      throw new ForbiddenException('You cannot access this ticket');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);

    const ticket = await this.prisma.supportTicket.update({
      where: { id },
      data: dto,
      include: this.ticketInclude(),
    });

    if (dto.assignedToId) {
      await this.notifications.create({
        userId: dto.assignedToId,
        type: NotificationType.TICKET_UPDATED,
        title: 'Ticket assigned to you',
        message: ticket.subject,
        metadata: { ticketId: ticket.id },
      });
    }

    this.realtime.emitToTicket(id, 'ticket:updated', ticket);

    return ticket;
  }

  async addMessage(id: string, actor: JwtPayload, dto: CreateTicketMessageDto) {
    const ticket = await this.findOne(id, actor);

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: actor.sub,
        message: dto.message,
        isInternal: dto.isInternal ?? false,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status:
          ticket.status === TicketStatus.OPEN
            ? TicketStatus.IN_PROGRESS
            : ticket.status,
      },
    });

    const notifyUserId =
      actor.sub === ticket.client.userId
        ? ticket.assignedToId
        : ticket.client.userId;

    if (notifyUserId) {
      await this.notifications.create({
        userId: notifyUserId,
        type: NotificationType.TICKET_MESSAGE,
        title: 'New ticket message',
        message: ticket.subject,
        metadata: { ticketId: id },
      });
    }

    this.realtime.emitToTicket(id, 'ticket:message', message);

    return message;
  }

  private ticketInclude(includeMessages = true) {
    return {
      client: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      ...(includeMessages && {
        messages: {
          orderBy: { createdAt: 'asc' as const },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      }),
    };
  }
}
