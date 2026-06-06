import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(payload: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const data: Prisma.NotificationUncheckedCreateInput = {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata,
      isPublic: false,
    };

    const notification = await this.prisma.notification.create({
      data,
    });

    this.realtime.emitToUser(payload.userId, 'notification:new', notification);

    return notification;
  }

  async createPublic(payload: {
    type?: NotificationType;
    title: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const data: Prisma.NotificationUncheckedCreateInput = {
      userId: null,
      type: payload.type || NotificationType.SYSTEM_ANNOUNCEMENT,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata,
      isPublic: true,
    };

    const notification = await this.prisma.notification.create({
      data,
    });

    this.realtime.emitPublic('notification:new', notification);

    return notification;
  }

  async findMine(userId: string) {
    const where: Prisma.NotificationWhereInput = {
      OR: [{ userId }, { isPublic: true }],
    };

    return this.prisma.notification.findMany({
      where,
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
