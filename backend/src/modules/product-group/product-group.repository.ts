import { ProductGroup } from '@entities/product-group.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '@common/base.repository';
import { IProductGroupRepository } from './interfaces/product-group.repository.interface';
import { QueryProductGroupDto } from './dtos';
import { PaginatedResult } from '@common/types';

export class ProductGroupRepository
  extends BaseRepository<ProductGroup>
  implements IProductGroupRepository
{
  constructor(repo: Repository<ProductGroup>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'productGroup';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'groupName', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<ProductGroup>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(productGroup.groupName LIKE :search OR productGroup.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(queryOptions: QueryProductGroupDto): Promise<PaginatedResult<ProductGroup>> {
    return this.findAllWithPagination(queryOptions);
  }

  async findByName(name: string): Promise<ProductGroup | null> {
    return this.repository.findOne({ where: { groupName: name, isActive: true } });
  }

  async findWithFields(id: number): Promise<ProductGroup | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations: ['fields', 'fields.options'],
    });
  }

  async countProductsByGroup(groupId: number): Promise<number> {
    return this.repository
      .createQueryBuilder('productGroup')
      .innerJoin('productGroup.products', 'product')
      .where('productGroup.id = :groupId', { groupId })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getCount();
  }
}
