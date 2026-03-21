import { User } from '@entities/user.entity';
import { PaginatedResult } from '@common/types';
import { IUserRepository } from '../../interfaces/user.repository.interface';
import { QueryUserDto } from '../../dtos';

export class FakeUserRepository implements IUserRepository {
  public store: User[] = [];
  private nextId = 1;

  async findAll(options: QueryUserDto): Promise<PaginatedResult<User>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const active = this.store.filter((u) => u.isActive);
    const total = active.length;
    const totalPages = Math.ceil(total / limit);
    const data = active.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit, totalPages };
  }

  async findById(id: number): Promise<User | null> {
    return this.store.find((u) => u.id === id && u.isActive) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.find((u) => u.email === email && u.isActive) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.store.find((u) => u.username === username && u.isActive) ?? null;
  }

  async create(data: Partial<User>): Promise<User> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      isTempPassword: false,
      Middlename: null,
      role: null,
      passwordResetTokens: [],
      passwordHash: data.passwordHash ?? 'hashed',
      ...data,
    } as User;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const idx = this.store.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((u) => u.isActive).length;
  }
}
