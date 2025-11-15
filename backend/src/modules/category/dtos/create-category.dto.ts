import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(255, { message: 'Category name must not exceed 255 characters' })
  categoryName!: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Photo must be a string' })
  @IsOptional()
  photo?: string;
}
