import { ProductGroup } from '@entities/product-group.entity';
import { IProductGroupRepository } from './interfaces/product-group.repository.interface';
import { CreateProductGroupDto, UpdateProductGroupDto, QueryProductGroupDto } from './dtos';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

export class ProductGroupService {
  constructor(private repo: IProductGroupRepository) {}

  async getAllGroups(query: QueryProductGroupDto): Promise<PaginatedResult<ProductGroup>> {
    return this.repo.findAll(query);
  }

  async getGroupById(id: number): Promise<ProductGroup> {
    const group = await this.repo.findWithFields(id);
    validateEntityExists(group, 'Product group');
    return group;
  }

  async createGroup(data: CreateProductGroupDto): Promise<ProductGroup> {
    const existing = await this.repo.findByName(data.groupName);
    validateUniqueness(existing, undefined, 'Group name', data.groupName);
    return this.repo.create(data);
  }

  async updateGroup(id: number, data: UpdateProductGroupDto): Promise<ProductGroup> {
    const group = await this.repo.findById(id);
    validateEntityExists(group, 'Product group');
    if (data.groupName && data.groupName !== group.groupName) {
      const existing = await this.repo.findByName(data.groupName);
      validateUniqueness(existing, id, 'Group name', data.groupName);
    }
    const updated = await this.repo.update(id, data);
    validateEntityExists(updated, 'Product group');
    return updated;
  }

  async deleteGroup(id: number): Promise<void> {
    const group = await this.repo.findById(id);
    validateEntityExists(group, 'Product group');
    const productCount = await this.repo.countProductsByGroup(id);
    if (productCount > 0) {
      throw new Error('Cannot delete group with existing products');
    }
    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'Product group');
  }
}
