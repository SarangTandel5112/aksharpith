import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttributeValueResponseDto {
  @Expose() id: string;
  @Expose() value: string;
  @Expose() code: string;
  @Expose() sortOrder: number | null;
  @Expose() isActive: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date | null;
}

export class ProductAttributeResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  code: string;

  @ApiPropertyOptional()
  @Expose()
  productId: string | null;

  @ApiPropertyOptional()
  @Expose()
  sortOrder: number | null;

  @ApiProperty()
  @Expose()
  isRequired: boolean;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  updatedAt: Date | null;

  @ApiPropertyOptional({ type: [AttributeValueResponseDto] })
  @Expose()
  @Type(() => AttributeValueResponseDto)
  values?: AttributeValueResponseDto[];

  constructor(partial: Partial<ProductAttributeResponseDto>) {
    Object.assign(this, partial);
  }
}
