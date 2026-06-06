import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(payload: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const notification = await this.prisma.notification.create({
      data: payload,
    });

    this.realtime.emitToUser(payload.userId, 'notification:new', notification);

    return notification;
  }

  async findMine(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
