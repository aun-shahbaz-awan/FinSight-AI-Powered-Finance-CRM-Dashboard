import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TicketPriority, TicketStatus } from '@finsight/database';

export class TicketQueryDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}
