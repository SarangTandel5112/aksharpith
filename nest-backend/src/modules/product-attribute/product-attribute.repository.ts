import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { resolveSortField } from '../../common/utils/sort.util';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { QueryProductAttributeDto } from './dto/query-product-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';

@Injectable()
export class ProductAttributeRepository {
  private static readonly ALLOWED_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'name',
    'code',
    'sortOrder',
    'isActive',
  ] as const;

  constructor(
    @InjectRepository(ProductAttribute)
    private readonly repo: Repository<ProductAttribute>,
    @InjectRepository(ProductAttributeValue)
    private readonly valueRepo: Repository<ProductAttributeValue>,
  ) {}

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  async findAll(query: QueryProductAttributeDto): Promise<[ProductAttribute[], number]> {
    const { page, limit, sortBy = 'createdAt', order = 'ASC', search, isActive } = query;
    const safeSortBy = resolveSortField(
      sortBy,
      ProductAttributeRepository.ALLOWED_SORT_FIELDS,
      'createdAt',
    );
    const where: FindOptionsWhere<ProductAttribute> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [safeSortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<ProductAttribute | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findWithValues(id: string): Promise<ProductAttribute | null> {
    return this.repo.findOne({ where: { id }, relations: ['values'] });
  }

  async findByName(name: string): Promise<ProductAttribute | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(dto: CreateProductAttributeDto): Promise<ProductAttribute> {
    const attr = this.repo.create({
      name: dto.name,
      code: dto.code ?? this.slugify(dto.name),
      productId: dto.productId ?? null,
      sortOrder: dto.sortOrder ?? null,
      isRequired: dto.isRequired ?? true,
      values:
        dto.values?.map((v) => ({
          value: v.value,
          code: v.code ?? this.slugify(v.value),
          sortOrder: v.sortOrder ?? null,
          isActive: v.isActive ?? true,
        })) ?? [],
    });
    return this.repo.save(attr);
  }

  async update(id: string, dto: UpdateProductAttributeDto): Promise<ProductAttribute | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async addValue(
    attributeId: string,
    dto: CreateAttributeValueDto,
  ): Promise<ProductAttributeValue> {
    const val = this.valueRepo.create({
      ...dto,
      code: dto.code ?? this.slugify(dto.value),
      sortOrder: dto.sortOrder ?? null,
      attributeId,
    });
    return this.valueRepo.save(val);
  }

  async findValueById(valueId: string): Promise<ProductAttributeValue | null> {
    return this.valueRepo.findOne({ where: { id: valueId } });
  }

  async updateValue(
    valueId: string,
    dto: UpdateAttributeValueDto,
  ): Promise<ProductAttributeValue | null> {
    await this.valueRepo.update(valueId, dto);
    return this.findValueById(valueId);
  }

  async softDeleteValue(valueId: string): Promise<boolean> {
    const result = await this.valueRepo.softDelete(valueId);
    return (result.affected ?? 0) > 0;
  }
}
