import { IRepository } from '@common/interfaces/repository.interface';
import { ProductGroup } from '@entities/product-group.entity';
import { PaginatedResult } from '@common/types';
import { QueryProductGroupDto } from '../dtos';

export interface IProductGroupRepository extends IRepository<ProductGroup> {
  findAll(options: QueryProductGroupDto): Promise<PaginatedResult<ProductGroup>>;
  findByName(name: string): Promise<ProductGroup | null>;
  findWithFields(id: number): Promise<ProductGroup | null>;
  countProductsByGroup(groupId: number): Promise<number>;
}
