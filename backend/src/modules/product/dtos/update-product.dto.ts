import {
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

export class UpdateProductDto {
  // Core Product Fields
  @IsString({ message: 'Product code must be a string' })
  @IsOptional()
  @MaxLength(10, { message: 'Product code must not exceed 10 characters' })
  @Matches(/^[A-Za-z0-9]+$/, { message: 'Product code must be alphanumeric' })
  productCode?: string;

  @IsString({ message: 'UPC code must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'UPC code must not exceed 20 characters' })
  upcCode?: string;

  @IsString({ message: 'Product name must be a string' })
  @IsOptional()
  @MaxLength(150, { message: 'Product name must not exceed 150 characters' })
  productName?: string;

  @IsString({ message: 'Product type must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Product type must not exceed 50 characters' })
  productType?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsString({ message: 'Model must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Model must not exceed 100 characters' })
  model?: string;

  @IsInt({ message: 'Department ID must be an integer' })
  @IsOptional()
  departmentId?: number;

  @IsInt({ message: 'Category ID must be an integer' })
  @IsOptional()
  categoryId?: number;

  @IsInt({ message: 'Sub-category ID must be an integer' })
  @IsOptional()
  subCategoryId?: number;

  @IsString({ message: 'Size must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Size must not exceed 50 characters' })
  size?: string;

  @IsInt({ message: 'Pack ID must be an integer' })
  @IsOptional()
  packId?: number;

  @IsString({ message: 'Vintage must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Vintage must not exceed 20 characters' })
  vintage?: string;

  @IsString({ message: 'HSN code must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'HSN code must not exceed 20 characters' })
  @Matches(/^\d+$/, { message: 'HSN code must be numeric' })
  hsnCode?: string;

  // GST Fields
  @IsBoolean({ message: 'GST 1 must be a boolean' })
  @IsOptional()
  gst1?: boolean;

  @IsString({ message: 'GST 1 slab must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'GST 1 slab must not exceed 50 characters' })
  gst1Slab?: string;

  @IsBoolean({ message: 'GST 2 must be a boolean' })
  @IsOptional()
  gst2?: boolean;

  @IsString({ message: 'GST 2 slab must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'GST 2 slab must not exceed 50 characters' })
  gst2Slab?: string;

  @IsBoolean({ message: 'GST 3 must be a boolean' })
  @IsOptional()
  gst3?: boolean;

  @IsString({ message: 'GST 3 slab must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'GST 3 slab must not exceed 50 characters' })
  gst3Slab?: string;

  @IsBoolean({ message: 'Non taxable must be a boolean' })
  @IsOptional()
  nonTaxable?: boolean;

  // Status Fields
  @IsBoolean({ message: 'Item inactive must be a boolean' })
  @IsOptional()
  itemInactive?: boolean;

  @IsBoolean({ message: 'Non stock item must be a boolean' })
  @IsOptional()
  nonStockItem?: boolean;

  // Price and Stock
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit price must be a number with up to 2 decimal places' }
  )
  @IsOptional()
  @Min(0, { message: 'Unit price must be at least 0' })
  unitPrice?: number;

  @IsInt({ message: 'Stock quantity must be an integer' })
  @IsOptional()
  stockQuantity?: number;

  // Product Photos (up to 6)
  @IsArray({ message: 'Product photos must be an array' })
  @IsString({ each: true, message: 'Each product photo must be a string URL' })
  @IsOptional()
  @ArrayMaxSize(6, { message: 'Product photos must not exceed 6 images' })
  productPhotos?: string[];

  // Vendor Details
  @IsString({ message: 'Vendor details must be a string' })
  @IsOptional()
  vendorDetails?: string;

  // Zone (multiple assignment)
  @IsArray({ message: 'Zones must be an array' })
  @IsInt({ each: true, message: 'Each zone must be an integer ID' })
  @IsOptional()
  zones?: number[];

  // Marketing Photos (up to 10)
  @IsArray({ message: 'Marketing photos must be an array' })
  @IsString({
    each: true,
    message: 'Each marketing photo must be a string URL',
  })
  @IsOptional()
  @ArrayMaxSize(10, { message: 'Marketing photos must not exceed 10 images' })
  marketingPhotos?: string[];

  // Marketing Videos
  @IsArray({ message: 'Marketing videos must be an array' })
  @IsString({
    each: true,
    message: 'Each marketing video must be a string URL',
  })
  @IsOptional()
  marketingVideos?: string[];

  // Physical Attributes
  @IsString({ message: 'Height must be a string' })
  @IsOptional()
  @MaxLength(30, { message: 'Height must not exceed 30 characters' })
  height?: string;

  @IsString({ message: 'Length must be a string' })
  @IsOptional()
  @MaxLength(30, { message: 'Length must not exceed 30 characters' })
  length?: string;

  @IsString({ message: 'Width must be a string' })
  @IsOptional()
  @MaxLength(30, { message: 'Width must not exceed 30 characters' })
  width?: string;

  @IsString({ message: 'Weight must be a string' })
  @IsOptional()
  @MaxLength(30, { message: 'Weight must not exceed 30 characters' })
  weight?: string;

  @IsString({ message: 'Color must be a string' })
  @IsOptional()
  @MaxLength(30, { message: 'Color must not exceed 30 characters' })
  color?: string;

  // Custom Fields by Department
  @IsObject({ message: 'Custom fields must be an object' })
  @IsOptional()
  customFields?: Record<string, string>;

  // Legacy fields (for backward compatibility)
  @IsString({ message: 'Photo must be a string' })
  @IsOptional()
  photo?: string;

  // Legacy price field (for backward compatibility)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with up to 2 decimal places' }
  )
  @IsOptional()
  @Min(0, { message: 'Price must be at least 0' })
  price?: number;
}
