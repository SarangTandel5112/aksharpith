import { ProductGroup } from '@entities/product-group.entity';
import { CreateProductGroupDto, UpdateProductGroupDto, QueryProductGroupDto } from '../dtos';
import { PaginatedResult } from '@common/types';

export interface IProductGroupService {
  getAllGroups(query: QueryProductGroupDto): Promise<PaginatedResult<ProductGroup>>;
  getGroupById(id: number): Promise<ProductGroup>;
  createGroup(data: CreateProductGroupDto): Promise<ProductGroup>;
  updateGroup(id: number, data: UpdateProductGroupDto): Promise<ProductGroup>;
  deleteGroup(id: number): Promise<void>;
}
