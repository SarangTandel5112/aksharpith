import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { resolveSortField } from '../../common/utils/sort.util';
import { SubCategory } from './entities/sub-category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { QuerySubCategoryDto } from './dto/query-sub-category.dto';

@Injectable()
export class SubCategoryRepository {
  private static readonly ALLOWED_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'name',
    'sortOrder',
    'isActive',
  ] as const;

  constructor(
    @InjectRepository(SubCategory)
    private readonly repo: Repository<SubCategory>,
  ) {}

  async findAll(query: QuerySubCategoryDto): Promise<[SubCategory[], number]> {
    const { page, limit, sortBy = 'createdAt', order = 'ASC', search, categoryId, isActive } = query;
    const safeSortBy = resolveSortField(
      sortBy,
      SubCategoryRepository.ALLOWED_SORT_FIELDS,
      'createdAt',
    );
    const where: FindOptionsWhere<SubCategory> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [safeSortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<SubCategory | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByNameAndCategory(name: string, categoryId: string): Promise<SubCategory | null> {
    return this.repo.findOne({ where: { name, categoryId } });
  }

  async create(dto: CreateSubCategoryDto): Promise<SubCategory> {
    const sub = this.repo.create(dto);
    return this.repo.save(sub);
  }

  async update(id: string, dto: UpdateSubCategoryDto): Promise<SubCategory | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
