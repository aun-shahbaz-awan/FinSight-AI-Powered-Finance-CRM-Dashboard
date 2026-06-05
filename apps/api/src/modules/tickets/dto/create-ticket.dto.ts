import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TicketPriority } from '@finsight/database';

export class CreateTicketDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
