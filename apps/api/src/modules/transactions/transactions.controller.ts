import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@finsight/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { ReviewTransactionDto } from './dto/review-transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.CLIENT,
  )
  create(@Body() dto: CreateTransactionDto, @CurrentUser() user: JwtPayload) {
    return this.transactionsService.create(dto, user);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.SUPPORT_AGENT,
  )
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.SUPPORT_AGENT,
  )
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/review')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  review(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewTransactionDto,
  ) {
    return this.transactionsService.review(id, user.sub, dto);
  }

  @Patch(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  complete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('note') note?: string,
  ) {
    return this.transactionsService.markCompleted(id, user.sub, note);
  }

  @Patch(':id/cancel')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.CLIENT,
  )
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('note') note?: string,
  ) {
    return this.transactionsService.cancel(id, user.sub, note);
  }
}
