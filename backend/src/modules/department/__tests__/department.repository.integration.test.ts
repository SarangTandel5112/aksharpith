import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { DepartmentRepository } from '../department.repository';
import { Department } from '@entities/department.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let repo: DepartmentRepository;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE departments RESTART IDENTITY CASCADE');
  repo = new DepartmentRepository(dataSource.getRepository(Department));
});

describe('DepartmentRepository', () => {
  it('creates and retrieves a department by id', async () => {
    const created = await repo.create({ departmentName: 'Electronics', isActive: true });
    const found = await repo.findById(created.id);
    expect(found?.departmentName).toBe('Electronics');
  });

  it('finds department by code', async () => {
    await repo.create({ departmentName: 'Electronics', departmentCode: 'ELEC', isActive: true });
    const found = await repo.findByCode('ELEC');
    expect(found?.departmentName).toBe('Electronics');
  });

  it('finds department by name', async () => {
    await repo.create({ departmentName: 'Clothing', isActive: true });
    const found = await repo.findByName('Clothing');
    expect(found?.departmentName).toBe('Clothing');
  });

  it('soft deletes a department (findById returns null after delete)', async () => {
    const created = await repo.create({ departmentName: 'Stationery', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findByCode returns null after soft delete', async () => {
    const created = await repo.create({
      departmentName: 'Stationery',
      departmentCode: 'STAT',
      isActive: true,
    });
    await repo.delete(created.id);
    const found = await repo.findByCode('STAT');
    expect(found).toBeNull();
  });

  it('findAll returns paginated result with only active departments', async () => {
    const d1 = await repo.create({ departmentName: 'Electronics', isActive: true });
    await repo.create({ departmentName: 'Clothing', isActive: true });
    await repo.delete(d1.id);

    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].departmentName).toBe('Clothing');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('findAll returns correct pagination metadata', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create({ departmentName: `Department ${i}`, isActive: true });
    }
    const result = await repo.findAll({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });
});
