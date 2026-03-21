import { ProductVariant } from '@entities/product-variant.entity';
import { CreateProductVariantDto, UpdateProductVariantDto } from '../dtos';

export interface IProductVariantService {
  getVariantsByProduct(productId: number): Promise<ProductVariant[]>;
  getVariantById(id: number): Promise<ProductVariant>;
  generateVariants(productId: number): Promise<ProductVariant[]>;
  createVariant(productId: number, data: CreateProductVariantDto): Promise<ProductVariant>;
  updateVariant(id: number, data: UpdateProductVariantDto): Promise<ProductVariant>;
  deleteVariant(id: number): Promise<void>;
}
