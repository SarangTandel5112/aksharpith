import { Expose, Type } from 'class-transformer';

export class VariantAttributeDto {
  @Expose() variantId: string;
  @Expose() attributeId: string;
  @Expose() attributeValueId: string;
}

export class VariantResponseDto {
  @Expose() id: string;
  @Expose() productId: string;
  @Expose() sku: string;
  @Expose() price: number;
  @Expose() stockQuantity: number;
  @Expose() combinationHash: string;
  @Expose() isDeleted: boolean;
  @Expose() isActive: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() @Type(() => VariantAttributeDto) variantAttributes: VariantAttributeDto[];
}
