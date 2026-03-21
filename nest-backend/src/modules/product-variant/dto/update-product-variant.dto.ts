import { IsNumber, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateProductVariantDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
