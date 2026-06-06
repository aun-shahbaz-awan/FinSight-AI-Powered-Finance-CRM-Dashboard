import { Injectable } from '@nestjs/common';
import { AuditAction, type AuditLog, type Prisma } from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(payload: {
    action: AuditAction;
    actorId?: string;
    entity?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AuditLog> {
    return await this.prisma.auditLog.create({
      data: payload,
    });
  }
}
