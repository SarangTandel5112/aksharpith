import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttributeValueResponseDto {
  @Expose() id: string;
  @Expose() value: string;
  @Expose() sortOrder: number;
  @Expose() isActive: boolean;
  @Expose() createdAt: Date;
}

export class ProductAttributeResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [AttributeValueResponseDto] })
  @Expose()
  @Type(() => AttributeValueResponseDto)
  values?: AttributeValueResponseDto[];

  constructor(partial: Partial<ProductAttributeResponseDto>) {
    Object.assign(this, partial);
  }
}
