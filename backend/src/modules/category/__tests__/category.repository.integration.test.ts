import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { CategoryRepository } from '../category.repository';
import { ProductCategory } from '@entities/product-category.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let repo: CategoryRepository;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE product_categories RESTART IDENTITY CASCADE');
  repo = new CategoryRepository(dataSource.getRepository(ProductCategory));
});

describe('CategoryRepository', () => {
  it('creates and retrieves a category by id', async () => {
    const created = await repo.create({ categoryName: 'Electronics', isActive: true });
    const found = await repo.findById(created.id);
    expect(found?.categoryName).toBe('Electronics');
  });

  it('finds category by name', async () => {
    await repo.create({ categoryName: 'Clothing', isActive: true });
    const found = await repo.findByName('Clothing');
    expect(found?.categoryName).toBe('Clothing');
  });

  it('soft deletes a category (findById returns null after delete)', async () => {
    const created = await repo.create({ categoryName: 'Stationery', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findByName returns null after soft delete', async () => {
    const created = await repo.create({ categoryName: 'Toys', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findByName('Toys');
    expect(found).toBeNull();
  });

  it('findAll returns paginated result with only active categories', async () => {
    const c1 = await repo.create({ categoryName: 'Electronics', isActive: true });
    await repo.create({ categoryName: 'Clothing', isActive: true });
    await repo.delete(c1.id);

    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].categoryName).toBe('Clothing');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('findAll returns correct pagination metadata', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create({ categoryName: `Category ${i}`, isActive: true });
    }
    const result = await repo.findAll({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('findByDepartmentId returns categories for the given department', async () => {
    await repo.create({ categoryName: 'Electronics', isActive: true, departmentId: 1 });
    await repo.create({ categoryName: 'Clothing', isActive: true, departmentId: 2 });
    await repo.create({ categoryName: 'Gadgets', isActive: true, departmentId: 1 });

    const result = await repo.findByDepartmentId(1);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.categoryName)).toEqual(
      expect.arrayContaining(['Electronics', 'Gadgets'])
    );
  });

  it('findByDepartmentId excludes soft-deleted categories', async () => {
    const created = await repo.create({
      categoryName: 'Electronics',
      isActive: true,
      departmentId: 1,
    });
    await repo.delete(created.id);

    const result = await repo.findByDepartmentId(1);
    expect(result).toHaveLength(0);
  });
});
