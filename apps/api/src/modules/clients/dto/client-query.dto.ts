import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientStatus, KycStatus } from '@finsight/database';

export class ClientQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}
