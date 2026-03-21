import { ProductVariant } from '@entities/product-variant.entity';
import { IProductVariantRepository } from './interfaces/product-variant.repository.interface';
import { IProductRepository } from '@modules/product/interfaces/product.repository.interface';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dtos';
import { validateEntityExists, validateDeletion } from '@helpers/entity.helper';
import { buildCombinationHash } from './combination-hash';

export class ProductVariantService {
  constructor(
    private variantRepo: IProductVariantRepository,
    private productRepo: IProductRepository,
  ) {}

  async getVariantsByProduct(productId: number): Promise<ProductVariant[]> {
    const product = await this.productRepo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.variantRepo.findByProductIdWithAttributes(productId);
  }

  async getVariantById(id: number): Promise<ProductVariant> {
    const variant = await this.variantRepo.findById(id);
    validateEntityExists(variant, 'Product variant');
    // Safe: validated above that variant exists
    return variant!;
  }

  async generateVariants(productId: number): Promise<ProductVariant[]> {
    const product = await this.productRepo.findById(productId, ['attributes', 'attributes.values']);
    validateEntityExists(product, 'Product');

    if (product!.productType !== 'Lot Matrix') {
      throw new Error('Cannot generate variants for a Standard product');
    }

    const attributes = (product!.attributes ?? []).filter((a) => a.isActive);
    if (attributes.length === 0) {
      throw new Error('Product must have at least one attribute to generate variants');
    }

    const allValues = attributes.map((a) => (a.values ?? []).filter((v) => v.isActive));
    if (allValues.some((vals) => vals.length < 2)) {
      throw new Error('Each attribute must have at least two active values to generate variants');
    }

    const combinations = cartesianProduct(allValues);
    const created: ProductVariant[] = [];

    for (const combo of combinations) {
      const attributeValueIds = combo.map((v) => v.id);
      const hash = buildCombinationHash(attributeValueIds);

      const exists = await this.variantRepo.findByHash(productId, hash);
      if (exists) continue;

      const sku = `${product!.productCode}-${hash}`;
      const variant = await this.variantRepo.create({
        productId,
        sku,
        combinationHash: hash,
        stockQuantity: 0,
        isActive: true,
        isDeleted: false,
      });

      for (const value of combo) {
        await this.variantRepo.addAttributeMapping(variant.id, value.attributeId, value.id);
      }
      created.push(variant);
    }
    return created;
  }

  async createVariant(productId: number, data: CreateProductVariantDto): Promise<ProductVariant> {
    const product = await this.productRepo.findById(productId);
    validateEntityExists(product, 'Product');

    const existingSku = await this.variantRepo.findBySku(data.sku);
    if (existingSku) throw new Error('Product variant SKU already exists');

    const hash = buildCombinationHash(data.attributeValueIds);
    const variant = await this.variantRepo.create({
      productId,
      sku: data.sku,
      upc: data.upc ?? null,
      costPrice: data.costPrice ?? null,
      unitPrice: data.unitPrice ?? null,
      salePrice: data.salePrice ?? null,
      stockQuantity: data.stockQuantity ?? 0,
      combinationHash: hash,
      isActive: true,
      isDeleted: false,
    });

    return variant;
  }

  async updateVariant(id: number, data: UpdateProductVariantDto): Promise<ProductVariant> {
    const variant = await this.variantRepo.findById(id);
    validateEntityExists(variant, 'Product variant');
    const updated = await this.variantRepo.update(id, data);
    validateEntityExists(updated, 'Product variant');
    // Safe: validated above that updated entity exists
    return updated!;
  }

  async deleteVariant(id: number): Promise<void> {
    const variant = await this.variantRepo.findById(id);
    validateEntityExists(variant, 'Product variant');
    const deleted = await this.variantRepo.delete(id);
    validateDeletion(deleted, 'Product variant');
  }
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
    [[]]
  );
}
