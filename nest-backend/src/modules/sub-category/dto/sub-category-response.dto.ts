import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() categoryId: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  constructor(partial: Partial<SubCategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
