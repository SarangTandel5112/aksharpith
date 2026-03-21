import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  FindOptionsWhere,
  Between,
  MoreThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductPhysicalAttributes } from './entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from './entities/product-marketing-media.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { UpsertPhysicalAttributesDto } from './dto/upsert-physical-attributes.dto';
import { CreateMarketingMediaDto } from './dto/create-marketing-media.dto';
import { ProductZone } from './entities/product-zone.entity';
import { CreateProductZoneDto } from './dto/create-product-zone.dto';
import { ProductVendor } from './entities/product-vendor.entity';
import { CreateProductVendorDto } from './dto/create-product-vendor.dto';
import { ProductGroupFieldValue } from './entities/product-group-field-value.entity';
import { UpsertGroupFieldValueDto } from './dto/upsert-group-field-value.dto';
import { FieldValueItemDto } from './dto/bulk-upsert-group-field-values.dto';
import { GroupField } from '../product-group/entities/group-field.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(ProductMedia)
    private readonly mediaRepo: Repository<ProductMedia>,
    @InjectRepository(ProductPhysicalAttributes)
    private readonly physRepo: Repository<ProductPhysicalAttributes>,
    @InjectRepository(ProductMarketingMedia)
    private readonly marketingMediaRepo: Repository<ProductMarketingMedia>,
    @InjectRepository(ProductZone)
    private readonly zoneRepo: Repository<ProductZone>,
    @InjectRepository(ProductVendor)
    private readonly vendorRepo: Repository<ProductVendor>,
    @InjectRepository(ProductGroupFieldValue)
    private readonly groupFieldValueRepo: Repository<ProductGroupFieldValue>,
    @InjectRepository(GroupField)
    private readonly groupFieldRepo: Repository<GroupField>,
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

    const { gf } = query;
    if (gf && Object.keys(gf).length > 0) {
      const qb = this.repo
        .createQueryBuilder('product')
        .where(where)
        .orderBy(`product.${sortBy}`, order as 'ASC' | 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      this.applyGroupFieldFilters(qb, gf);
      return qb.getManyAndCount();
    }

    return this.repo.findAndCount({
      where,
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  applyGroupFieldFilters(
    qb: SelectQueryBuilder<Product>,
    gf: Record<string, string>,
  ): void {
    Object.entries(gf).forEach(([key, rawValue], idx) => {
      const paramPrefix = `gf_${idx}`;
      let condition: string;
      let params: Record<string, unknown> = { [`${paramPrefix}_key`]: key };

      if (rawValue.startsWith('$btw:')) {
        const [min, max] = rawValue.slice(5).split(',').map(Number);
        condition = `v${idx}.value_number BETWEEN :${paramPrefix}_min AND :${paramPrefix}_max`;
        params = {
          ...params,
          [`${paramPrefix}_min`]: min,
          [`${paramPrefix}_max`]: max,
        };
      } else if (rawValue.startsWith('$gte:')) {
        condition = `v${idx}.value_number >= :${paramPrefix}_val`;
        params = {
          ...params,
          [`${paramPrefix}_val`]: Number(rawValue.slice(5)),
        };
      } else if (rawValue.startsWith('$lte:')) {
        condition = `v${idx}.value_number <= :${paramPrefix}_val`;
        params = {
          ...params,
          [`${paramPrefix}_val`]: Number(rawValue.slice(5)),
        };
      } else if (rawValue.startsWith('$ilike:')) {
        condition = `v${idx}.value_text ILIKE :${paramPrefix}_val`;
        params = {
          ...params,
          [`${paramPrefix}_val`]: `%${rawValue.slice(7)}%`,
        };
      } else {
        condition = `(v${idx}.value_text = :${paramPrefix}_val OR v${idx}.value_boolean::text = :${paramPrefix}_val OR EXISTS (SELECT 1 FROM group_field_options o${idx} WHERE o${idx}.id = v${idx}.value_option_id AND o${idx}.option_value = :${paramPrefix}_val))`;
        params = { ...params, [`${paramPrefix}_val`]: rawValue };
      }

      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_group_field_values v${idx}
          JOIN group_fields f${idx} ON f${idx}.id = v${idx}.field_id
          WHERE v${idx}.product_id = product.id
            AND f${idx}.field_key = :${paramPrefix}_key
            AND f${idx}.is_filterable = true
            AND ${condition}
        )`,
        params,
      );
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

  // Marketing media sub-resource
  async addMarketingMedia(
    productId: string,
    dto: CreateMarketingMediaDto,
  ): Promise<ProductMarketingMedia> {
    const media = this.marketingMediaRepo.create({ ...dto, productId });
    return this.marketingMediaRepo.save(media);
  }

  async getMarketingMedia(productId: string): Promise<ProductMarketingMedia[]> {
    return this.marketingMediaRepo.find({
      where: { productId },
      order: { displayOrder: 'ASC' },
    });
  }

  async removeMarketingMedia(mediaId: string): Promise<boolean> {
    const result = await this.marketingMediaRepo.delete(mediaId);
    return (result.affected ?? 0) > 0;
  }

  // Zone sub-resource
  async addZone(
    productId: string,
    dto: CreateProductZoneDto,
  ): Promise<ProductZone> {
    const zone = this.zoneRepo.create({ ...dto, productId });
    return this.zoneRepo.save(zone);
  }

  async getZones(productId: string): Promise<ProductZone[]> {
    return this.zoneRepo.find({ where: { productId } });
  }

  async updateZone(
    zoneId: string,
    dto: Partial<CreateProductZoneDto>,
  ): Promise<void> {
    await this.zoneRepo.update(zoneId, dto);
  }

  async removeZone(zoneId: string): Promise<boolean> {
    const result = await this.zoneRepo.delete(zoneId);
    return (result.affected ?? 0) > 0;
  }

  // Group field values sub-resource
  async upsertGroupFieldValue(
    productId: string,
    dto: UpsertGroupFieldValueDto,
  ): Promise<ProductGroupFieldValue> {
    let value = await this.groupFieldValueRepo.findOne({
      where: { productId, fieldId: dto.fieldId },
    });
    if (value) {
      Object.assign(value, {
        valueText: dto.valueText ?? null,
        valueNumber: dto.valueNumber ?? null,
        valueBoolean: dto.valueBoolean ?? null,
        valueOptionId: dto.valueOptionId ?? null,
      });
    } else {
      value = this.groupFieldValueRepo.create({
        productId,
        fieldId: dto.fieldId,
        valueText: dto.valueText ?? null,
        valueNumber: dto.valueNumber ?? null,
        valueBoolean: dto.valueBoolean ?? null,
        valueOptionId: dto.valueOptionId ?? null,
      });
    }
    return this.groupFieldValueRepo.save(value);
  }

  async getGroupFieldValues(
    productId: string,
  ): Promise<ProductGroupFieldValue[]> {
    return this.groupFieldValueRepo.find({
      where: { productId },
      relations: ['field', 'field.options', 'valueOption'],
      order: { field: { sortOrder: 'ASC' } } as any,
    });
  }

  async bulkUpsertGroupFieldValues(
    productId: string,
    values: FieldValueItemDto[],
  ): Promise<void> {
    if (values.length === 0) return;
    const rows = values.map((v) => ({ ...v, productId }));
    await this.groupFieldValueRepo.upsert(rows, {
      conflictPaths: ['productId', 'fieldId'],
    });
  }

  async removeGroupFieldValue(
    productId: string,
    fieldId: string,
  ): Promise<boolean> {
    const result = await this.groupFieldValueRepo.delete({
      productId,
      fieldId,
    });
    return (result.affected ?? 0) > 0;
  }

  async countGroupFieldValues(productId: string): Promise<number> {
    return this.groupFieldValueRepo.count({ where: { productId } });
  }

  async deleteGroupFieldValues(productId: string): Promise<void> {
    await this.groupFieldValueRepo.delete({ productId });
  }

  async getFieldIdsByGroupId(groupId: string): Promise<string[]> {
    const fields = await this.groupFieldRepo.find({
      where: { groupId },
      select: ['id'],
    });
    return fields.map((f) => f.id);
  }

  // Vendor sub-resource
  async addVendor(
    productId: string,
    dto: CreateProductVendorDto,
  ): Promise<ProductVendor> {
    const vendor = this.vendorRepo.create({ ...dto, productId });
    return this.vendorRepo.save(vendor);
  }

  async getVendors(productId: string): Promise<ProductVendor[]> {
    return this.vendorRepo.find({ where: { productId } });
  }

  async updateVendor(
    vendorId: string,
    dto: Partial<CreateProductVendorDto>,
  ): Promise<void> {
    await this.vendorRepo.update(vendorId, dto);
  }

  async removeVendor(vendorId: string): Promise<boolean> {
    const result = await this.vendorRepo.delete(vendorId);
    return (result.affected ?? 0) > 0;
  }
}
