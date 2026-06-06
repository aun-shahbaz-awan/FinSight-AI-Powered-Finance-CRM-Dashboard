import { Prisma } from '@finsight/database';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePublicNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  metadata?: Prisma.InputJsonObject;
}
