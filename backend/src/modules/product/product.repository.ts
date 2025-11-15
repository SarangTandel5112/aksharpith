import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { Product } from '@entities';

export interface ProductQueryOptions {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
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

export class ProductRepository {
  private repository: Repository<Product>;

  constructor() {
    this.repository = AppDataSource.getRepository(Product);
  }

  async findAll(
    options: ProductQueryOptions
  ): Promise<PaginatedResult<Product>> {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      minStock,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = options;

    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(product.productName LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply category filter
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId,
      });
    }

    // Apply price range filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Apply stock filter
    if (minStock !== undefined) {
      queryBuilder.andWhere('product.stockQuantity >= :minStock', {
        minStock,
      });
    }

    // Apply sorting
    const allowedSortFields = [
      'id',
      'productName',
      'price',
      'stockQuantity',
      'description',
      'createdAt',
      'updatedAt',
    ];

    // Handle special case for category sorting (sort by category name)
    if (sortBy === 'categoryId' || sortBy === 'category') {
      queryBuilder.orderBy('category.categoryName', order);
    } else {
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      queryBuilder.orderBy(`product.${sortField}`, order);
    }

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

  async findById(id: number): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });
  }

  async findByName(productName: string): Promise<Product | null> {
    return this.repository.findOne({ where: { productName, isActive: true } });
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    return this.repository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.repository.create(productData);
    return this.repository.save(product);
  }

  async update(
    id: number,
    productData: Partial<Product>
  ): Promise<Product | null> {
    await this.repository.update(id, productData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }

  async countByCategory(categoryId: number): Promise<number> {
    return this.repository.count({ where: { categoryId, isActive: true } });
  }
}
