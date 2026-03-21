import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariantRepository } from './product-variant.repository';
import { Product } from '../product/entities/product.entity';
import { ProductAttributeValue } from '../product-attribute/entities/product-attribute-value.entity';
import { GenerateLotMatrixDto } from './dto/generate-lot-matrix.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { QueryProductVariantDto } from './dto/query-product-variant.dto';
import { buildCombinationHash } from './utils/combination-hash';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly variantRepo: ProductVariantRepository,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductAttributeValue)
    private readonly valueRepo: Repository<ProductAttributeValue>,
  ) {}

  async findAll(productId: string, query: QueryProductVariantDto) {
    await this.ensureProductExists(productId);
    return this.variantRepo.findAll({ ...query, productId });
  }

  async findOne(productId: string, id: string) {
    await this.ensureProductExists(productId);
    const variant = await this.variantRepo.findById(id);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException(`Variant ${id} not found`);
    }
    return variant;
  }

  async create(productId: string, dto: CreateProductVariantDto) {
    await this.ensureProductExists(productId);
    const hash = buildCombinationHash(dto.attributeValueIds);
    const existing = await this.variantRepo.findByCombinationHash(productId, hash);
    if (existing && !existing.isDeleted && !existing.deletedAt) {
      throw new ConflictException('Variant with this attribute combination already exists');
    }
    const values = await this.valueRepo.findByIds(dto.attributeValueIds);
    const attributeMap: Record<string, string> = {};
    values.forEach((v) => {
      attributeMap[v.id] = v.attributeId;
    });
    return this.variantRepo.createWithAttributes(productId, dto, attributeMap);
  }

  async update(productId: string, id: string, dto: UpdateProductVariantDto) {
    await this.findOne(productId, id);
    await this.variantRepo.update(id, dto);
    return this.variantRepo.findById(id);
  }

  async remove(productId: string, id: string): Promise<void> {
    await this.findOne(productId, id);
    await this.variantRepo.softDelete(id);
  }

  async generateMatrix(productId: string, dto: GenerateLotMatrixDto) {
    await this.ensureProductExists(productId);

    const valuesByAttribute: Map<string, ProductAttributeValue[]> = new Map();
    for (const attributeId of dto.attributeIds) {
      const values = await this.valueRepo.find({ where: { attributeId } });
      if (values.length === 0) {
        throw new NotFoundException(`Attribute ${attributeId} not found or has no values`);
      }
      valuesByAttribute.set(attributeId, values);
    }

    const allGroups = Array.from(valuesByAttribute.values());
    const combinations = this.cartesian(allGroups);

    const results = [];
    for (const combination of combinations) {
      const valueIds = combination.map((v) => v.id);
      const hash = buildCombinationHash(valueIds);
      const existing = await this.variantRepo.findByCombinationHash(productId, hash);

      if (existing) {
        if (!existing.isDeleted && !existing.deletedAt) {
          results.push(existing);
          continue;
        }
        await this.variantRepo.restore(existing.id);
        results.push(await this.variantRepo.findById(existing.id));
        continue;
      }

      const attributeMap: Record<string, string> = {};
      combination.forEach((v) => {
        attributeMap[v.id] = v.attributeId;
      });
      const autoSku = `${productId.slice(0, 8)}-${hash.slice(0, 12)}`;
      const newVariant = await this.variantRepo.createWithAttributes(
        productId,
        { sku: autoSku, price: 0, stockQuantity: 0, attributeValueIds: valueIds },
        attributeMap,
      );
      results.push(newVariant);
    }

    return results;
  }

  private cartesian(arrays: ProductAttributeValue[][]): ProductAttributeValue[][] {
    return arrays.reduce<ProductAttributeValue[][]>(
      (acc, arr) => acc.flatMap((combo) => arr.map((val) => [...combo, val])),
      [[]],
    );
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
  }
}
