import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  FindOptionsWhere,
  Between,
  MoreThanOrEqual,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductPhysicalAttributes } from './entities/product-physical-attributes.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { UpsertPhysicalAttributesDto } from './dto/upsert-physical-attributes.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(ProductMedia)
    private readonly mediaRepo: Repository<ProductMedia>,
    @InjectRepository(ProductPhysicalAttributes)
    private readonly physRepo: Repository<ProductPhysicalAttributes>,
  ) {}

  async findAll(query: QueryProductDto): Promise<[Product[], number]> {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      order = 'ASC',
      search,
      departmentId,
      subCategoryId,
      groupId,
      productType,
      isActive,
      itemInactive,
      minPrice,
      maxPrice,
      minStock,
    } = query;

    const where: FindOptionsWhere<Product> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (departmentId) where.departmentId = departmentId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (groupId) where.groupId = groupId;
    if (productType) where.productType = productType;
    if (isActive !== undefined) where.isActive = isActive;
    if (itemInactive !== undefined) where.itemInactive = itemInactive;

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.basePrice = Between(minPrice, maxPrice) as any;
    } else if (minPrice !== undefined) {
      where.basePrice = MoreThanOrEqual(minPrice) as any;
    } else if (maxPrice !== undefined) {
      where.basePrice = Between(0, maxPrice) as any;
    }

    if (minStock !== undefined) {
      where.stockQuantity = MoreThanOrEqual(minStock) as any;
    }

    return this.repo.findAndCount({
      where,
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<Product | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.repo.findOne({ where: { sku } });
  }

  async countByType(): Promise<Record<string, number>> {
    const results = await this.repo
      .createQueryBuilder('p')
      .select('p.product_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('p.deleted_at IS NULL')
      .groupBy('p.product_type')
      .getRawMany();
    return results.reduce(
      (acc, r) => ({ ...acc, [r.type]: Number(r.count) }),
      {},
    );
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  // Media sub-resource
  async addMedia(
    productId: string,
    dto: CreateProductMediaDto,
  ): Promise<ProductMedia> {
    const media = this.mediaRepo.create({ ...dto, productId });
    return this.mediaRepo.save(media);
  }

  async getMedia(productId: string): Promise<ProductMedia[]> {
    return this.mediaRepo.find({ where: { productId } });
  }

  async deleteMedia(mediaId: string): Promise<boolean> {
    const result = await this.mediaRepo.delete(mediaId);
    return (result.affected ?? 0) > 0;
  }

  // Physical attributes sub-resource
  async upsertPhysicalAttributes(
    productId: string,
    dto: UpsertPhysicalAttributesDto,
  ): Promise<ProductPhysicalAttributes> {
    let attrs = await this.physRepo.findOne({ where: { productId } });
    if (attrs) {
      Object.assign(attrs, dto);
    } else {
      attrs = this.physRepo.create({ ...dto, productId });
    }
    return this.physRepo.save(attrs);
  }

  async getPhysicalAttributes(
    productId: string,
  ): Promise<ProductPhysicalAttributes | null> {
    return this.physRepo.findOne({ where: { productId } });
  }
}
