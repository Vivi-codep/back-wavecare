import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString()
  image?: string;

  @Type(() => Number)
  @IsInt()
  stock!: number;

  @IsString()
  season!: string;

  @IsString()
  category!: string;
}