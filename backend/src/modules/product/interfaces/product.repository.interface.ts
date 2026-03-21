import { IRepository } from '@common/interfaces/repository.interface';
import { Product } from '@entities/product.entity';
import { PaginatedResult } from '@common/types';
import { QueryProductDto } from '../dtos';

export interface IProductRepository extends IRepository<Product> {
  findAll(options: QueryProductDto): Promise<PaginatedResult<Product>>;
  findByCode(code: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findByDepartmentId(departmentId: number): Promise<Product[]>;
  findBySubCategoryId(subCategoryId: number): Promise<Product[]>;
}
