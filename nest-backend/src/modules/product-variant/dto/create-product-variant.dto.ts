import { IsString, IsNumber, IsInt, IsUUID, ArrayMinSize, IsOptional, Min } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  attributeValueIds: string[];
}
