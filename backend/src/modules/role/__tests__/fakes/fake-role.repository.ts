import { UserRole } from '@entities/user-role.entity';
import { IRoleRepository } from '../../interfaces/role.repository.interface';

export class FakeRoleRepository implements IRoleRepository {
  public store: UserRole[] = [];
  private nextId = 1;

  async findAll(): Promise<UserRole[]> {
    return this.store.filter(r => r.isActive);
  }

  async findById(id: number): Promise<UserRole | null> {
    return this.store.find(r => r.id === id && r.isActive) ?? null;
  }

  async findByName(name: string): Promise<UserRole | null> {
    return this.store.find(r => r.roleName === name && r.isActive) ?? null;
  }

  async create(data: Partial<UserRole>): Promise<UserRole> {
    const role = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      ...data,
    } as UserRole;
    this.store.push(role);
    return role;
  }

  async update(id: number, data: Partial<UserRole>): Promise<UserRole | null> {
    const idx = this.store.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter(r => r.isActive).length;
  }
}
