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
  upc: string | null;

  @ApiPropertyOptional()
  @Expose()
  description: string | null;

  @ApiProperty()
  @Expose()
  productType: string;

  @ApiProperty()
  @Expose()
  basePrice: number;

  @ApiPropertyOptional()
  @Expose()
  model: string | null;

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

  @ApiPropertyOptional()
  @Expose()
  hsnCode: string | null;

  @ApiProperty()
  @Expose()
  nonTaxable: boolean;

  @ApiProperty()
  @Expose()
  itemInactive: boolean;

  @ApiProperty()
  @Expose()
  nonStockItem: boolean;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  updatedAt: Date | null;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}
