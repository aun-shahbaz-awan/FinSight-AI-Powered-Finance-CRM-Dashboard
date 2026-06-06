import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [NotificationsModule, RealtimeModule, AuditModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
