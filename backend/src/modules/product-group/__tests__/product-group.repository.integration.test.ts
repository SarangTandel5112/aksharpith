import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { ProductGroupRepository } from '../product-group.repository';
import { ProductGroup } from '@entities/product-group.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let repo: ProductGroupRepository;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE product_groups RESTART IDENTITY CASCADE');
  repo = new ProductGroupRepository(dataSource.getRepository(ProductGroup));
});

describe('ProductGroupRepository', () => {
  it('creates and retrieves a product group by id', async () => {
    const created = await repo.create({ groupName: 'Electronics', isActive: true });
    const found = await repo.findById(created.id);
    expect(found?.groupName).toBe('Electronics');
  });

  it('finds product group by name', async () => {
    await repo.create({ groupName: 'Clothing', isActive: true });
    const found = await repo.findByName('Clothing');
    expect(found?.groupName).toBe('Clothing');
  });

  it('findByName returns null for non-existent name', async () => {
    const found = await repo.findByName('NonExistent');
    expect(found).toBeNull();
  });

  it('soft deletes a product group (findById returns null after delete)', async () => {
    const created = await repo.create({ groupName: 'Stationery', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findByName returns null after soft delete', async () => {
    const created = await repo.create({ groupName: 'Stationery', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findByName('Stationery');
    expect(found).toBeNull();
  });

  it('findAll returns paginated result with only active groups', async () => {
    const g1 = await repo.create({ groupName: 'Electronics', isActive: true });
    await repo.create({ groupName: 'Clothing', isActive: true });
    await repo.delete(g1.id);

    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].groupName).toBe('Clothing');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('findAll returns correct pagination metadata', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create({ groupName: `Group ${i}`, isActive: true });
    }
    const result = await repo.findAll({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('countProductsByGroup returns 0 when no products are linked', async () => {
    const created = await repo.create({ groupName: 'Electronics', isActive: true });
    const count = await repo.countProductsByGroup(created.id);
    expect(count).toBe(0);
  });

  it('findWithFields returns group with relations or null if not found', async () => {
    const created = await repo.create({ groupName: 'Electronics', isActive: true });
    const found = await repo.findWithFields(created.id);
    expect(found?.groupName).toBe('Electronics');

    const notFound = await repo.findWithFields(9999);
    expect(notFound).toBeNull();
  });
});
