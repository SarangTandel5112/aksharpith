import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupFieldOptionResponseDto {
  @Expose() id: string;
  @Expose() optionLabel: string;
  @Expose() optionValue: string;
  @Expose() sortOrder: number;
  @Expose() isActive: boolean;
}

export class GroupFieldResponseDto {
  @Expose() id: string;
  @Expose() fieldName: string;
  @Expose() fieldKey: string;
  @Expose() fieldType: string;
  @Expose() isRequired: boolean;
  @Expose() isFilterable: boolean;
  @Expose() sortOrder: number;
  @Expose() isActive: boolean;
  @Expose()
  @Type(() => GroupFieldOptionResponseDto)
  options?: GroupFieldOptionResponseDto[];
}

export class ProductGroupResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiPropertyOptional() @Expose() description: string | null;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional() @Expose() updatedAt: Date | null;
  @ApiPropertyOptional({ type: [GroupFieldResponseDto] })
  @Expose()
  @Type(() => GroupFieldResponseDto)
  fields?: GroupFieldResponseDto[];

  constructor(partial: Partial<ProductGroupResponseDto>) {
    Object.assign(this, partial);
  }
}
