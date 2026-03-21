import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateProductVendorDto {
  @IsString()
  @MaxLength(150)
  vendorName: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @MaxLength(15)
  @IsOptional()
  gstin?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
