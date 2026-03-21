import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { SubCategoryRepository } from '../sub-category.repository';
import { SubCategory } from '@entities/sub-category.entity';
import { ProductCategory } from '@entities/product-category.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let repo: SubCategoryRepository;
let categoryId: number;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE sub_categories RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE product_categories RESTART IDENTITY CASCADE');

  // Create a category to satisfy the FK constraint
  const categoryRepo = dataSource.getRepository(ProductCategory);
  const category = await categoryRepo.save({ categoryName: 'Electronics', isActive: true });
  categoryId = category.id;

  repo = new SubCategoryRepository(dataSource.getRepository(SubCategory));
});

describe('SubCategoryRepository', () => {
  it('creates and retrieves a sub-category by id', async () => {
    const created = await repo.create({
      subCategoryName: 'Phones',
      categoryId,
      isActive: true,
    });
    const found = await repo.findById(created.id);
    expect(found?.subCategoryName).toBe('Phones');
  });

  it('findByNameAndCategory finds matching active entry', async () => {
    await repo.create({ subCategoryName: 'Laptops', categoryId, isActive: true });
    const found = await repo.findByNameAndCategory('Laptops', categoryId);
    expect(found?.subCategoryName).toBe('Laptops');
  });

  it('findByNameAndCategory returns null after soft delete', async () => {
    const created = await repo.create({
      subCategoryName: 'Laptops',
      categoryId,
      isActive: true,
    });
    await repo.delete(created.id);
    const found = await repo.findByNameAndCategory('Laptops', categoryId);
    expect(found).toBeNull();
  });

  it('findByNameAndCategory returns null when category does not match', async () => {
    await repo.create({ subCategoryName: 'Laptops', categoryId, isActive: true });
    const found = await repo.findByNameAndCategory('Laptops', 9999);
    expect(found).toBeNull();
  });

  it('soft deletes a sub-category (findById returns null after delete)', async () => {
    const created = await repo.create({
      subCategoryName: 'Headphones',
      categoryId,
      isActive: true,
    });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findAll returns paginated result with only active sub-categories', async () => {
    const sc1 = await repo.create({ subCategoryName: 'Phones', categoryId, isActive: true });
    await repo.create({ subCategoryName: 'Laptops', categoryId, isActive: true });
    await repo.delete(sc1.id);

    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].subCategoryName).toBe('Laptops');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('findAll returns correct pagination metadata', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create({ subCategoryName: `SubCat ${i}`, categoryId, isActive: true });
    }
    const result = await repo.findAll({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('findByCategoryId returns sub-categories for the given category', async () => {
    // Create a second category
    const categoryRepo = dataSource.getRepository(ProductCategory);
    const category2 = await categoryRepo.save({ categoryName: 'Clothing', isActive: true });

    await repo.create({ subCategoryName: 'Phones', categoryId, isActive: true });
    await repo.create({ subCategoryName: 'Laptops', categoryId, isActive: true });
    await repo.create({ subCategoryName: 'Shirts', categoryId: category2.id, isActive: true });

    const result = await repo.findByCategoryId(categoryId);
    expect(result).toHaveLength(2);
    expect(result.map((sc) => sc.subCategoryName)).toEqual(
      expect.arrayContaining(['Phones', 'Laptops'])
    );
  });

  it('findByCategoryId excludes soft-deleted sub-categories', async () => {
    const created = await repo.create({
      subCategoryName: 'Phones',
      categoryId,
      isActive: true,
    });
    await repo.delete(created.id);

    const result = await repo.findByCategoryId(categoryId);
    expect(result).toHaveLength(0);
  });
});
