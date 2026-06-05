import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { KycModule } from './modules/kyc/kyc.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TicketsModule } from './modules/tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env', '.env'],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    ClientsModule,
    KycModule,
    TransactionsModule,
    RealtimeModule,
    NotificationsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
