import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Clothing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;
}
