import { Injectable } from '@nestjs/common';
import {
  KycStatus,
  TicketStatus,
  TransactionStatus,
  TransactionType,
} from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalClients,
      activeClients,
      pendingKyc,
      openTickets,
      pendingTransactions,
      completedDeposits,
      completedWithdrawals,
      recentClients,
      recentTransactions,
      recentTickets,
    ] = await Promise.all([
      this.prisma.client.count(),

      this.prisma.client.count({
        where: { status: 'ACTIVE' },
      }),

      this.prisma.client.count({
        where: { kycStatus: KycStatus.PENDING },
      }),

      this.prisma.supportTicket.count({
        where: {
          status: {
            in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
          },
        },
      }),

      this.prisma.transaction.count({
        where: { status: TransactionStatus.PENDING },
      }),

      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),

      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),

      this.prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      this.prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.supportTicket.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: {
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalClients,
        activeClients,
        pendingKyc,
        openTickets,
        pendingTransactions,
        totalDeposits: completedDeposits._sum.amount || 0,
        totalWithdrawals: completedWithdrawals._sum.amount || 0,
      },
      recentClients,
      recentTransactions,
      recentTickets,
    };
  }
}
