import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { UserRepository } from '../user.repository';
import { User } from '@entities/user.entity';
import { UserRole } from '@entities/user-role.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let repo: UserRepository;
let roleId: number;

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
  // Create a role for users to reference
  const roleRepo = dataSource.getRepository(UserRole);
  const role = await roleRepo.save({ roleName: 'Admin', isActive: true });
  roleId = role.id;
  repo = new UserRepository(dataSource.getRepository(User));
});

describe('UserRepository', () => {
  it('creates and retrieves a user by id', async () => {
    const created = await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    const found = await repo.findById(created.id);
    expect(found?.username).toBe('alice');
    expect(found?.email).toBe('alice@example.com');
  });

  it('finds user by email', async () => {
    await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    const found = await repo.findByEmail('alice@example.com');
    expect(found?.username).toBe('alice');
  });

  it('finds user by username', async () => {
    await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    const found = await repo.findByUsername('alice');
    expect(found?.email).toBe('alice@example.com');
  });

  it('soft deletes a user (findById returns null after delete)', async () => {
    const created = await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findByEmail returns null after soft delete', async () => {
    const created = await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    await repo.delete(created.id);
    const found = await repo.findByEmail('alice@example.com');
    expect(found).toBeNull();
  });

  it('findByUsername returns null after soft delete', async () => {
    const created = await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    await repo.delete(created.id);
    const found = await repo.findByUsername('alice');
    expect(found).toBeNull();
  });

  it('findAll returns paginated result with only active users', async () => {
    const u1 = await repo.create({
      username: 'alice',
      Firstname: 'Alice',
      Lastname: 'Smith',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    await repo.create({
      username: 'bob',
      Firstname: 'Bob',
      Lastname: 'Jones',
      email: 'bob@example.com',
      passwordHash: 'hashed',
      roleId,
      isActive: true,
      isTempPassword: false,
    });
    await repo.delete(u1.id);

    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].username).toBe('bob');
    expect(result.total).toBe(1);
  });
});
