import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { User } from '@entities';

export interface UserQueryOptions {
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

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(
    options: UserQueryOptions
  ): Promise<PaginatedResult<User>> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = options;

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.isActive = :isActive', { isActive: true });

    // Apply search filter
    if (search && search !== 'undefined' && search.trim() !== '') {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR user.Firstname LIKE :search OR user.Lastname LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const allowedSortFields = ['id', 'username', 'email', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, order);

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

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, isActive: true },
      relations: ['role']
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations: ['role']
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
