import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { resolveSortField } from '../../common/utils/sort.util';
import { ProductGroup } from './entities/product-group.entity';
import { GroupField } from './entities/group-field.entity';
import { GroupFieldOption } from './entities/group-field-option.entity';
import { ProductGroupFieldValue } from '../product/entities/product-group-field-value.entity';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { QueryProductGroupDto } from './dto/query-product-group.dto';
import { AddGroupFieldDto } from './dto/add-group-field.dto';
import { UpdateGroupFieldDto } from './dto/update-group-field.dto';
import { CreateGroupFieldOptionDto } from './dto/create-group-field-option.dto';
import { UpdateGroupFieldOptionDto } from './dto/update-group-field-option.dto';

@Injectable()
export class ProductGroupRepository {
  private static readonly ALLOWED_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'name',
    'isActive',
  ] as const;

  constructor(
    @InjectRepository(ProductGroup)
    private readonly repo: Repository<ProductGroup>,
    @InjectRepository(GroupField)
    private readonly fieldRepo: Repository<GroupField>,
    @InjectRepository(GroupFieldOption)
    private readonly optionRepo: Repository<GroupFieldOption>,
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
    const safeSortBy = resolveSortField(
      sortBy,
      ProductGroupRepository.ALLOWED_SORT_FIELDS,
      'createdAt',
    );
    const where: FindOptionsWhere<ProductGroup> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [safeSortBy]: order },
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
      description: dto.description ?? null,
      fields:
        dto.fields?.map((f) => ({
          fieldName: f.fieldName,
          fieldKey: f.fieldKey ?? this.slugify(f.fieldName),
          fieldType: f.fieldType,
          isRequired: f.isRequired ?? false,
          isFilterable: f.isFilterable ?? false,
          sortOrder: f.sortOrder ?? 0,
          isActive: true,
          options:
            f.options?.map((o) => ({
              optionLabel: o.optionLabel,
              optionValue: o.optionValue,
              sortOrder: o.sortOrder ?? 0,
              isActive: o.isActive ?? true,
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
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    if (!slug) throw new Error('Cannot slugify empty field name');
    return slug;
  }

  async addField(groupId: string, dto: AddGroupFieldDto): Promise<GroupField> {
    const fieldKey = dto.fieldKey ?? this.slugify(dto.fieldName);
    const { fieldKey: _fk, ...rest } = dto as any;
    const field = this.fieldRepo.create({ ...rest, groupId, fieldKey });
    return this.fieldRepo.save(field) as unknown as Promise<GroupField>;
  }

  async findFieldById(fieldId: string): Promise<GroupField | null> {
    return this.fieldRepo.findOne({ where: { id: fieldId } });
  }

  async updateField(
    fieldId: string,
    dto: UpdateGroupFieldDto,
  ): Promise<GroupField | null> {
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

  async addOption(
    fieldId: string,
    dto: CreateGroupFieldOptionDto,
  ): Promise<GroupFieldOption> {
    const option = this.optionRepo.create({ ...dto, fieldId });
    return this.optionRepo.save(option) as unknown as Promise<GroupFieldOption>;
  }

  async findOptionById(optionId: string): Promise<GroupFieldOption | null> {
    return this.optionRepo.findOne({ where: { id: optionId } });
  }

  async updateOption(
    optionId: string,
    dto: UpdateGroupFieldOptionDto,
  ): Promise<GroupFieldOption | null> {
    await this.optionRepo.update(optionId, dto);
    return this.optionRepo.findOne({ where: { id: optionId } });
  }

  async deleteOption(optionId: string): Promise<boolean> {
    const result = await this.optionRepo.delete(optionId);
    return (result.affected ?? 0) > 0;
  }

  async countOptionUsage(optionId: string): Promise<number> {
    return this.groupFieldValueRepo.count({
      where: { valueOptionId: optionId },
    });
  }
}
