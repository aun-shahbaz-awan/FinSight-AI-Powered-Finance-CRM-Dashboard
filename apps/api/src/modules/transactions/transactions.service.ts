import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionStatus, type Prisma } from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { ReviewTransactionDto } from './dto/review-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, actorId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        clientId: dto.clientId,
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency.toUpperCase(),
        reference: dto.reference,
        description: dto.description,
        requestedById: actorId,
        auditLogs: {
          create: {
            actorId,
            action: 'TRANSACTION_CREATED',
            toStatus: TransactionStatus.PENDING,
            note: dto.description,
          },
        },
      },
      include: {
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
        auditLogs: true,
      },
    });

    return transaction;
  }

  async findAll(query: TransactionQueryDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      ...(query.clientId && { clientId: query.clientId }),
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { reference: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          {
            client: {
              user: {
                email: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            client: {
              user: {
                firstName: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            client: {
              user: {
                lastName: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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
          requestedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
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

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async review(id: string, actorId: string, dto: ReviewTransactionDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending transactions can be reviewed',
      );
    }

    if (dto.status === TransactionStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: dto.status,
          reviewedById: actorId,
          reviewedAt: new Date(),
          rejectionReason:
            dto.status === TransactionStatus.REJECTED
              ? dto.rejectionReason
              : null,
        },
      });

      await tx.transactionAuditLog.create({
        data: {
          transactionId: id,
          actorId,
          action:
            dto.status === TransactionStatus.APPROVED
              ? 'TRANSACTION_APPROVED'
              : 'TRANSACTION_REJECTED',
          fromStatus: transaction.status,
          toStatus: dto.status,
          note: dto.note || dto.rejectionReason,
        },
      });

      return updated;
    });
  }

  async markCompleted(id: string, actorId: string, note?: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved transactions can be completed',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.COMPLETED,
        },
      });

      await tx.transactionAuditLog.create({
        data: {
          transactionId: id,
          actorId,
          action: 'TRANSACTION_COMPLETED',
          fromStatus: transaction.status,
          toStatus: TransactionStatus.COMPLETED,
          note,
        },
      });

      return updated;
    });
  }

  async cancel(id: string, actorId: string, note?: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending transactions can be cancelled',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.CANCELLED,
        },
      });

      await tx.transactionAuditLog.create({
        data: {
          transactionId: id,
          actorId,
          action: 'TRANSACTION_CANCELLED',
          fromStatus: transaction.status,
          toStatus: TransactionStatus.CANCELLED,
          note,
        },
      });

      return updated;
    });
  }
}
