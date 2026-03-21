import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupFieldOptionResponseDto {
  @Expose() id: string;
  @Expose() optionValue: string;
  @Expose() sortOrder: number;
}

export class GroupFieldResponseDto {
  @Expose() id: string;
  @Expose() fieldName: string;
  @Expose() fieldType: string;
  @Expose() isRequired: boolean;
  @Expose() sortOrder: number;
  @Expose()
  @Type(() => GroupFieldOptionResponseDto)
  options?: GroupFieldOptionResponseDto[];
}

export class ProductGroupResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;
  @ApiPropertyOptional({ type: [GroupFieldResponseDto] })
  @Expose()
  @Type(() => GroupFieldResponseDto)
  fields?: GroupFieldResponseDto[];

  constructor(partial: Partial<ProductGroupResponseDto>) {
    Object.assign(this, partial);
  }
}
