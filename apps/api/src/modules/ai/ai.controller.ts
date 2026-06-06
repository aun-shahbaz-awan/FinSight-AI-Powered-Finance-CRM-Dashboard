import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@finsight/database';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AiService } from './ai.service';
import { DashboardQuestionDto } from './dto/dashboard-question.dto';
import { GenerateSupportReplyDto } from './dto/generate-support-reply.dto';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('tickets/:ticketId/summary')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.SUPPORT_AGENT,
  )
  summarizeTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.summarizeTicket(ticketId, user.sub);
  }

  @Post('tickets/:ticketId/reply')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.SUPPORT_AGENT,
  )
  generateSupportReply(
    @Param('ticketId') ticketId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateSupportReplyDto,
  ) {
    return this.aiService.generateSupportReply(ticketId, user.sub, dto);
  }

  @Post('clients/:clientId/risk-summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  summarizeClientRisk(
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.summarizeClientRisk(clientId, user.sub);
  }

  @Post('dashboard/ask')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  askDashboardQuestion(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DashboardQuestionDto,
  ) {
    return this.aiService.askDashboardQuestion(user.sub, dto);
  }

  @Get('logs/me')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.SUPPORT_AGENT,
  )
  getMyAiLogs(
    @CurrentUser() user: JwtPayload,
  ): ReturnType<AiService['getMyLogs']> {
    return this.aiService.getMyLogs(user.sub);
  }
}
