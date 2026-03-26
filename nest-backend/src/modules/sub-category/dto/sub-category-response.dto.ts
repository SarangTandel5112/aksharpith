import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubCategoryResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() categoryId: string;
  @ApiPropertyOptional() @Expose() description: string | null;
  @ApiPropertyOptional() @Expose() photo: string | null;
  @ApiProperty() @Expose() sortOrder: number;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional() @Expose() updatedAt: Date | null;

  constructor(partial: Partial<SubCategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
