import { IsOptional, IsString } from 'class-validator';

export class GenerateSupportReplyDto {
  @IsOptional()
  @IsString()
  tone?: 'professional' | 'friendly' | 'firm';

  @IsOptional()
  @IsString()
  instruction?: string;
}
