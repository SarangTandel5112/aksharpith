import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '@entities';
import { BaseRepository } from '@common/base.repository';
import { PaginatedResult } from '@common/types';
import { IProductRepository } from './interfaces/product.repository.interface';
import { QueryProductDto } from './dtos';

export class ProductRepository extends BaseRepository<Product> implements IProductRepository {
  constructor(repo: Repository<Product>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'product';
  }

  protected getAllowedSortFields(): string[] {
    return [
      'id',
      'productCode',
      'productName',
      'unitPrice',
      'stockQuantity',
      'description',
      'createdAt',
      'updatedAt',
    ];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<Product>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(product.productName LIKE :search OR product.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(options: QueryProductDto): Promise<PaginatedResult<Product>> {
    const { departmentId, subCategoryId, minPrice, maxPrice, minStock, sortBy, order } = options;

    return this.findAllWithPagination(options, (qb) => {
      // Add relations
      qb.leftJoinAndSelect('product.department', 'department');
      qb.leftJoinAndSelect('product.subCategory', 'subCategory');
      qb.leftJoinAndSelect('subCategory.category', 'category');

      // Apply department filter
      if (departmentId) {
        qb.andWhere('product.departmentId = :departmentId', { departmentId });
      }

      // Apply sub-category filter
      if (subCategoryId) {
        qb.andWhere('product.subCategoryId = :subCategoryId', { subCategoryId });
      }

      // Apply price range filter
      if (minPrice !== undefined && maxPrice !== undefined) {
        qb.andWhere('product.unitPrice BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        qb.andWhere('product.unitPrice >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        qb.andWhere('product.unitPrice <= :maxPrice', { maxPrice });
      }

      // Apply stock filter
      if (minStock !== undefined) {
        qb.andWhere('product.stockQuantity >= :minStock', { minStock });
      }

      // Handle special case for sorting
      if (sortBy === 'department') {
        qb.orderBy('department.departmentName', order ?? 'DESC');
      } else if (sortBy === 'subCategory') {
        qb.orderBy('subCategory.subCategoryName', order ?? 'DESC');
      }
    });
  }

  async findById(id: number): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations: ['department', 'subCategory', 'subCategory.category'],
    });
  }

  async findByCode(productCode: string): Promise<Product | null> {
    return this.repository.findOne({ where: { productCode, isActive: true } });
  }

  async findByName(productName: string): Promise<Product | null> {
    return this.repository.findOne({ where: { productName, isActive: true } });
  }

  async findByDepartmentId(departmentId: number): Promise<Product[]> {
    return this.repository.find({ where: { departmentId, isActive: true } });
  }

  async findBySubCategoryId(subCategoryId: number): Promise<Product[]> {
    return this.repository.find({ where: { subCategoryId, isActive: true } });
  }
}
