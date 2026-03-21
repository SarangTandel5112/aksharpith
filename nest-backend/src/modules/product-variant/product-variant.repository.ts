import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantMedia } from './entities/product-variant-media.entity';
import { QueryProductVariantDto } from './dto/query-product-variant.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { buildCombinationHash } from './utils/combination-hash';

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant) private readonly repo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantMedia) private readonly mediaRepo: Repository<ProductVariantMedia>,
  ) {}

  async findAll(query: QueryProductVariantDto & { productId: string }) {
    const { page = 1, limit = 20, order = 'ASC', productId, isActive, isDeleted } = query;
    const where: Record<string, unknown> = { productId };
    if (isActive !== undefined) where.isActive = isActive;
    if (isDeleted !== undefined) where.isDeleted = isDeleted;
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: order as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['variantAttributes'],
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ProductVariant | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['variantAttributes', 'variantAttributes.attributeValue'],
    });
  }

  async findByCombinationHash(productId: string, hash: string): Promise<ProductVariant | null> {
    return this.repo.findOne({
      where: { productId, combinationHash: hash },
      withDeleted: true,
    });
  }

  async createWithAttributes(
    productId: string,
    dto: CreateProductVariantDto,
    attributeMap: Record<string, string>,
  ): Promise<ProductVariant> {
    const hash = buildCombinationHash(dto.attributeValueIds);
    const variant = this.repo.create({
      productId,
      sku: dto.sku,
      price: dto.price,
      stockQuantity: dto.stockQuantity ?? 0,
      combinationHash: hash,
      variantAttributes: dto.attributeValueIds.map((valueId) => ({
        attributeId: attributeMap[valueId],
        attributeValueId: valueId,
      })),
    });
    return this.repo.save(variant);
  }

  async update(id: string, dto: UpdateProductVariantDto): Promise<void> {
    await this.repo.update(id, dto as Record<string, unknown>);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
    await this.repo.update(id, { isDeleted: false });
  }

  async addMedia(
    variantId: string,
    dto: { url: string; mediaType?: string; isPrimary?: boolean },
  ): Promise<ProductVariantMedia> {
    const media = this.mediaRepo.create({ variantId, ...dto } as Partial<ProductVariantMedia>);
    return this.mediaRepo.save(media);
  }

  async getMedia(variantId: string): Promise<ProductVariantMedia[]> {
    return this.mediaRepo.find({ where: { variantId } });
  }

  async removeMedia(mediaId: string): Promise<boolean> {
    const result = await this.mediaRepo.delete(mediaId);
    return (result.affected ?? 0) > 0;
  }
}
