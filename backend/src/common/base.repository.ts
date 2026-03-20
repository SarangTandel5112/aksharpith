import { Repository, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { BaseQueryOptions, PaginatedResult } from './types';
import { IRepository } from './interfaces/repository.interface';

/**
 * Base Repository class providing common data access patterns
 * Implements Repository pattern with shared pagination and filtering logic
 * Follows DRY and Single Responsibility principles
 */
export abstract class BaseRepository<T extends ObjectLiteral>
  implements IRepository<T>
{
  constructor(protected repository: Repository<T>) {}

  /**
   * Get the entity name for query builder alias
   */
  protected abstract getEntityName(): string;

  /**
   * Get allowed sort fields for this entity
   */
  protected abstract getAllowedSortFields(): string[];

  /**
   * Apply search filters to query builder
   * Override this method in child classes to implement custom search logic
   */
  protected abstract applySearchFilter(
    queryBuilder: SelectQueryBuilder<T>,
    search: string
  ): void;

  /**
   * Common pagination logic
   * Creates a base query with pagination, sorting, and filtering
   */
  protected async findAllWithPagination(
    options: BaseQueryOptions,
    additionalWhere?: (qb: SelectQueryBuilder<T>) => void
  ): Promise<PaginatedResult<T>> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = options;

    const entityName = this.getEntityName();
    const queryBuilder = this.repository.createQueryBuilder(entityName);

    // Apply base where clause (isActive = true)
    queryBuilder.where(`${entityName}.isActive = :isActive`, {
      isActive: true,
    });

    // Apply additional where clauses if provided
    if (additionalWhere) {
      additionalWhere(queryBuilder);
    }

    // Apply search filter
    if (search && search !== 'undefined' && search.trim() !== '') {
      this.applySearchFilter(queryBuilder, search);
    }

    // Apply sorting
    const allowedSortFields = this.getAllowedSortFields();
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`${entityName}.${sortField}`, order);

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

  /**
   * Find entity by ID
   */
  async findById(id: number, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id, isActive: true } as any,
      relations,
    });
  }

  /**
   * Create a new entity
   */
  async create(entityData: Partial<T>): Promise<T> {
    const entity = this.repository.create(entityData as any);
    return this.repository.save(entity) as unknown as Promise<T>;
  }

  /**
   * Update an entity
   */
  async update(id: number, entityData: Partial<T>): Promise<T | null> {
    await this.repository.update(id, entityData as any);
    return this.findById(id);
  }

  /**
   * Soft delete an entity (set isActive to false)
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false } as any);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count all active entities
   */
  async count(additionalWhere?: any): Promise<number> {
    const where = { isActive: true, ...additionalWhere };
    return this.repository.count({ where } as any);
  }
}
