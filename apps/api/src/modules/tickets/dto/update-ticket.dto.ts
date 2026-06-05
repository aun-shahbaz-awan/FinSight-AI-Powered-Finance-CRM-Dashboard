import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TicketPriority, TicketStatus } from '@finsight/database';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
