import {
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '@finsight/database';

export class CreateTransactionDto {
  @IsUUID()
  clientId!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsDecimal()
  amount!: string;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
