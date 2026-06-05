import { IsString } from 'class-validator';

export class DashboardQuestionDto {
  @IsString()
  question!: string;
}
