import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  sku: string;

  @ApiPropertyOptional()
  @Expose()
  description: string | null;

  @ApiProperty()
  @Expose()
  productType: string;

  @ApiProperty()
  @Expose()
  basePrice: number;

  @ApiProperty()
  @Expose()
  stockQuantity: number;

  @ApiPropertyOptional()
  @Expose()
  departmentId: string | null;

  @ApiPropertyOptional()
  @Expose()
  subCategoryId: string | null;

  @ApiPropertyOptional()
  @Expose()
  groupId: string | null;

  @ApiProperty()
  @Expose()
  itemInactive: boolean;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}
