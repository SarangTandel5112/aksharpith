import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsIn,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  productCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  upcCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  productName?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Standard', 'Lot Matrix'])
  productType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @IsOptional()
  departmentId?: number;

  @IsInt()
  @IsOptional()
  subCategoryId?: number;

  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  pack?: string;

  @IsString()
  @IsOptional()
  vintage?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4,8}$/)
  hsnCode?: string;

  @IsBoolean()
  @IsOptional()
  nonTaxable?: boolean;

  @IsBoolean()
  @IsOptional()
  itemInactive?: boolean;

  @IsBoolean()
  @IsOptional()
  nonStockItem?: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsInt()
  @IsOptional()
  stockQuantity?: number;
}
