import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
  IsObject,
  Min,
  MaxLength,
  Matches,
  ArrayMaxSize,
} from 'class-validator';

export class CreateProductDto {
  // Core Product Fields
  @IsString({ message: 'Product code must be a string' })
  @IsNotEmpty({ message: 'Product code is required' })
  @MaxLength(10, { message: 'Product code must not exceed 10 characters' })
  @Matches(/^[A-Za-z0-9]+$/, { message: 'Product code must be alphanumeric' })
  productCode!: string;

  @IsString({ message: 'UPC code must be a string' })
  @IsNotEmpty({ message: 'UPC code is required' })
  @MaxLength(20, { message: 'UPC code must not exceed 20 characters' })
  upcCode!: string;

  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(150, { message: 'Product name must not exceed 150 characters' })
  productName!: string;

  @IsString({ message: 'Product type must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Product type must not exceed 50 characters' })
  productType?: string; // Standard or Lot Matrix

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsString({ message: 'Model must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Model must not exceed 100 characters' })
  model?: string;

  @IsInt({ message: 'Department ID must be an integer' })
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId!: number;

  @IsInt({ message: 'Sub-category ID must be an integer' })
  @IsNotEmpty({ message: 'Sub-category ID is required' })
  subCategoryId!: number;

  @IsString({ message: 'Size must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Size must not exceed 50 characters' })
  size?: string;

  @IsString({ message: 'Pack must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Pack must not exceed 100 characters' })
  pack?: string;

  @IsString({ message: 'Vintage must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Vintage must not exceed 20 characters' })
  vintage?: string;

  @IsString({ message: 'HSN code must be a string' })
  @IsNotEmpty({ message: 'HSN code is required' })
  @MaxLength(8, { message: 'HSN code must not exceed 8 characters' })
  @Matches(/^\d{4,8}$/, { message: 'HSN code must be 4, 6, or 8 digits' })
  hsnCode!: string;

  // GST Fields
  @IsBoolean({ message: 'GST 1 SGST must be a boolean' })
  @IsNotEmpty({ message: 'GST 1 SGST is required' })
  gst1Sgst!: boolean; // SGST

  @IsString({ message: 'GST 1 slab must be a string' })
  @IsNotEmpty({ message: 'GST 1 slab is required' })
  @MaxLength(10, { message: 'GST 1 slab must not exceed 10 characters' })
  gst1Slab!: string;

  @IsBoolean({ message: 'GST 2 CGST must be a boolean' })
  @IsNotEmpty({ message: 'GST 2 CGST is required' })
  gst2Cgst!: boolean; // CGST

  @IsString({ message: 'GST 2 slab must be a string' })
  @IsNotEmpty({ message: 'GST 2 slab is required' })
  @MaxLength(10, { message: 'GST 2 slab must not exceed 10 characters' })
  gst2Slab!: string;

  @IsBoolean({ message: 'GST 3 IGST must be a boolean' })
  @IsNotEmpty({ message: 'GST 3 IGST is required' })
  gst3Igst!: boolean; // IGST

  @IsString({ message: 'GST 3 slab must be a string' })
  @IsNotEmpty({ message: 'GST 3 slab is required' })
  @MaxLength(10, { message: 'GST 3 slab must not exceed 10 characters' })
  gst3Slab!: string;

  @IsBoolean({ message: 'Non taxable must be a boolean' })
  @IsNotEmpty({ message: 'Non taxable is required' })
  nonTaxable!: boolean;

  // Status Fields
  @IsBoolean({ message: 'Item inactive must be a boolean' })
  @IsNotEmpty({ message: 'Item inactive is required' })
  itemInactive!: boolean;

  @IsBoolean({ message: 'Non stock item must be a boolean' })
  @IsNotEmpty({ message: 'Non stock item is required' })
  nonStockItem!: boolean;

  // Price and Stock
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit price must be a number with up to 2 decimal places' }
  )
  @IsNotEmpty({ message: 'Unit price is required' })
  @Min(0, { message: 'Unit price must be at least 0' })
  unitPrice!: number;

  @IsInt({ message: 'Stock quantity must be an integer' })
  @IsNotEmpty({ message: 'Stock quantity is required' })
  stockQuantity!: number;

  // Note: Related entities (media, vendors, zones, physical attributes)
  // should be created separately via their respective endpoints after product creation
}
