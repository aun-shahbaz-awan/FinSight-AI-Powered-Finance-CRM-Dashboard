import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KycDocumentStatus } from '@finsight/database';

export class ReviewKycDto {
  @IsEnum(KycDocumentStatus)
  status!: KycDocumentStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
