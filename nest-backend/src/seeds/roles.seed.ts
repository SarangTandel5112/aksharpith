import { DataSource } from 'typeorm';
import { Role } from '../modules/role/entities/role.entity';

const DEFAULT_ROLES = ['Admin', 'Staff', 'Viewer'];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Role);

  for (const roleName of DEFAULT_ROLES) {
    const existing = await repo.findOne({ where: { roleName } });
    if (!existing) {
      const role = repo.create({ roleName, isActive: true });
      await repo.save(role);
      console.log(`Created role: ${roleName}`);
    } else {
      console.log(`Role already exists: ${roleName}`);
    }
  }
}
