import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { ProductGroup } from './entities/product-group.entity';
import { GroupField } from './entities/group-field.entity';
import { ProductGroupFieldValue } from '../product/entities/product-group-field-value.entity';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { QueryProductGroupDto } from './dto/query-product-group.dto';

@Injectable()
export class ProductGroupRepository {
  constructor(
    @InjectRepository(ProductGroup)
    private readonly repo: Repository<ProductGroup>,
    @InjectRepository(GroupField)
    private readonly fieldRepo: Repository<GroupField>,
    @InjectRepository(ProductGroupFieldValue)
    private readonly groupFieldValueRepo: Repository<ProductGroupFieldValue>,
  ) {}

  async findAll(
    query: QueryProductGroupDto,
  ): Promise<[ProductGroup[], number]> {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      order = 'ASC',
      search,
      isActive,
    } = query;
    const where: FindOptionsWhere<ProductGroup> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<ProductGroup | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findWithFields(id: string): Promise<ProductGroup | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['fields', 'fields.options'],
    });
  }

  async findByName(name: string): Promise<ProductGroup | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(dto: CreateProductGroupDto): Promise<ProductGroup> {
    const group = this.repo.create({
      name: dto.name,
      fields:
        dto.fields?.map((f) => ({
          fieldName: f.fieldName,
          fieldType: f.fieldType,
          isRequired: f.isRequired ?? false,
          sortOrder: f.sortOrder ?? 0,
          options:
            f.options?.map((o) => ({
              optionValue: o.optionValue,
              sortOrder: o.sortOrder ?? 0,
            })) ?? [],
        })) ?? [],
    });
    return this.repo.save(group);
  }

  async update(
    id: string,
    dto: UpdateProductGroupDto,
  ): Promise<ProductGroup | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  async addField(groupId: string, dto: any): Promise<GroupField> {
    const fieldKey = dto.fieldKey ?? this.slugify(dto.fieldName);
    const { fieldKey: _fk, ...rest } = dto as any;
    const field = this.fieldRepo.create({ ...rest, groupId, fieldKey });
    return this.fieldRepo.save(field) as unknown as Promise<GroupField>;
  }

  async findFieldById(fieldId: string): Promise<GroupField | null> {
    return this.fieldRepo.findOne({ where: { id: fieldId } });
  }

  async updateField(fieldId: string, dto: any): Promise<GroupField> {
    // never update fieldKey — explicitly exclude it
    const { fieldKey: _ignored, ...safeDto } = dto as any;
    await this.fieldRepo.update(fieldId, safeDto);
    return this.fieldRepo.findOne({ where: { id: fieldId } });
  }

  async deleteField(fieldId: string): Promise<boolean> {
    const result = await this.fieldRepo.softDelete(fieldId);
    return (result.affected ?? 0) > 0;
  }

  async countFieldValues(fieldId: string): Promise<number> {
    return this.groupFieldValueRepo.count({ where: { fieldId } });
  }
}
