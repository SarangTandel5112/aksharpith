import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { RoleRepository } from '../role.repository';
import { UserRole } from '@entities/user-role.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE user_roles RESTART IDENTITY CASCADE');
});

describe('RoleRepository', () => {
  it('creates and retrieves a role', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    const created = await repo.create({ roleName: 'Admin', isActive: true });
    const found = await repo.findById(created.id);
    expect(found?.roleName).toBe('Admin');
  });

  it('soft deletes a role', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    const created = await repo.create({ roleName: 'Cashier', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('finds role by name', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    await repo.create({ roleName: 'Manager', isActive: true });
    const found = await repo.findByName('Manager');
    expect(found?.roleName).toBe('Manager');
  });

  it('findAll returns only active roles', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    const r1 = await repo.create({ roleName: 'Admin', isActive: true });
    await repo.create({ roleName: 'Inactive', isActive: true });
    await repo.delete(r1.id);
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].roleName).toBe('Inactive');
  });
});
