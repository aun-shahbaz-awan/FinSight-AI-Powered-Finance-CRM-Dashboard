import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientStatus, KycStatus } from '@finsight/database';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
