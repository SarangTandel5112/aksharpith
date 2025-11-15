import { Repository, Like } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { ProductCategory } from '@entities';

export interface CategoryQueryOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CategoryRepository {
  private repository: Repository<ProductCategory>;

  constructor() {
    this.repository = AppDataSource.getRepository(ProductCategory);
  }

  async findAll(
    options: CategoryQueryOptions
  ): Promise<PaginatedResult<ProductCategory>> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = options;

    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.isActive = :isActive', { isActive: true });

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(category.categoryName LIKE :search OR category.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const allowedSortFields = [
      'id',
      'categoryName',
      'description',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`category.${sortField}`, order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results with count
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<ProductCategory | null> {
    return this.repository.findOne({ where: { id, isActive: true } });
  }

  async findByName(categoryName: string): Promise<ProductCategory | null> {
    return this.repository.findOne({ where: { categoryName, isActive: true } });
  }

  async create(
    categoryData: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    const category = this.repository.create(categoryData);
    return this.repository.save(category);
  }

  async update(
    id: number,
    categoryData: Partial<ProductCategory>
  ): Promise<ProductCategory | null> {
    await this.repository.update(id, categoryData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }
}
