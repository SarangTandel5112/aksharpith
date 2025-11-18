import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
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

  // GST Fields
  @IsBoolean()
  @IsOptional()
  gst1Sgst?: boolean;

  @IsString()
  @IsOptional()
  gst1Slab?: string;

  @IsBoolean()
  @IsOptional()
  gst2Cgst?: boolean;

  @IsString()
  @IsOptional()
  gst2Slab?: string;

  @IsBoolean()
  @IsOptional()
  gst3Igst?: boolean;

  @IsString()
  @IsOptional()
  gst3Slab?: string;

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
