import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { resolveSortField } from '../../common/utils/sort.util';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoryRepository {
  private static readonly ALLOWED_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'name',
    'isActive',
  ] as const;

  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async findAll(query: QueryCategoryDto): Promise<[Category[], number]> {
    const { page, limit, sortBy = 'createdAt', order = 'ASC', search, isActive } = query;
    const safeSortBy = resolveSortField(
      sortBy,
      CategoryRepository.ALLOWED_SORT_FIELDS,
      'createdAt',
    );
    const where: FindOptionsWhere<Category> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [safeSortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const cat = this.repo.create(dto);
    return this.repo.save(cat);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
