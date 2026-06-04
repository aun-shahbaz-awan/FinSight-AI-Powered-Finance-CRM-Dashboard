import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@finsight/database';

const REVIEWABLE_TRANSACTION_STATUSES = [
  TransactionStatus.APPROVED,
  TransactionStatus.REJECTED,
] as const;

export class ReviewTransactionDto {
  @IsEnum(REVIEWABLE_TRANSACTION_STATUSES)
  status!: (typeof REVIEWABLE_TRANSACTION_STATUSES)[number];

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
