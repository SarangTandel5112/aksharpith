import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { UserRole } from '@entities';

export class RoleRepository {
  private repository: Repository<UserRole>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserRole);
  }

  async findAll(): Promise<UserRole[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { roleName: 'ASC' }
    });
  }

  async findById(id: number): Promise<UserRole | null> {
    return this.repository.findOne({
      where: { id }
    });
  }
}
