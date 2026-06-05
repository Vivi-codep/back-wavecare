import { IsString } from 'class-validator';

export class QuizDto {
  @IsString()
  city!: string;

  @IsString()
  hairType!: string;

  @IsString()
  beachFrequency!: string;

  @IsString()
  sunProtection!: string;

  @IsString()
  wetHair!: string;

  @IsString()
  hairState!: string;

  @IsString()
  chemicalProcess!: string;

  @IsString()
  season!: string;
}