import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { ProductRepository } from '../product.repository';
import { Product } from '@entities/product.entity';
import { Department } from '@entities/department.entity';
import { ProductCategory } from '@entities/product-category.entity';
import { SubCategory } from '@entities/sub-category.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let repo: ProductRepository;
let departmentId: number;
let subCategoryId: number;

const baseProduct = () => ({
  productCode: 'PROD001',
  upcCode: 'UPC0000001',
  productName: 'Test Product',
  productType: 'Standard',
  departmentId,
  subCategoryId,
  hsnCode: '12345678',
  nonTaxable: false,
  itemInactive: false,
  nonStockItem: false,
  unitPrice: 99.99,
  stockQuantity: 10,
  isActive: true,
});

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE products RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE sub_categories RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE product_categories RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE departments RESTART IDENTITY CASCADE');

  // Create required parent entities
  const deptRepo = dataSource.getRepository(Department);
  const dept = await deptRepo.save({ departmentName: 'Electronics', isActive: true });
  departmentId = dept.id;

  const catRepo = dataSource.getRepository(ProductCategory);
  const cat = await catRepo.save({ categoryName: 'Tech', isActive: true });

  const subCatRepo = dataSource.getRepository(SubCategory);
  const subCat = await subCatRepo.save({
    subCategoryName: 'Phones',
    categoryId: cat.id,
    isActive: true,
  });
  subCategoryId = subCat.id;

  repo = new ProductRepository(dataSource.getRepository(Product));
});

describe('ProductRepository', () => {
  it('creates and retrieves a product by id', async () => {
    const created = await repo.create(baseProduct());
    const found = await repo.findById(created.id);
    expect(found?.productName).toBe('Test Product');
    expect(found?.productCode).toBe('PROD001');
  });

  it('findById returns null for non-existent product', async () => {
    const found = await repo.findById(9999);
    expect(found).toBeNull();
  });

  it('finds product by code', async () => {
    await repo.create(baseProduct());
    const found = await repo.findByCode('PROD001');
    expect(found?.productName).toBe('Test Product');
  });

  it('findByCode returns null after soft delete', async () => {
    const created = await repo.create(baseProduct());
    await repo.delete(created.id);
    const found = await repo.findByCode('PROD001');
    expect(found).toBeNull();
  });

  it('finds product by name', async () => {
    await repo.create(baseProduct());
    const found = await repo.findByName('Test Product');
    expect(found?.productCode).toBe('PROD001');
  });

  it('soft deletes a product (findById returns null after delete)', async () => {
    const created = await repo.create(baseProduct());
    const deleted = await repo.delete(created.id);
    expect(deleted).toBe(true);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findAll returns paginated result with only active products', async () => {
    const p1 = await repo.create(baseProduct());
    await repo.create({
      ...baseProduct(),
      productCode: 'PROD002',
      upcCode: 'UPC0000002',
      productName: 'Product Two',
    });
    await repo.delete(p1.id);

    const result = await repo.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].productName).toBe('Product Two');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('findAll returns correct pagination metadata', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create({
        ...baseProduct(),
        productCode: `PROD00${i}`,
        upcCode: `UPC000000${i}`,
        productName: `Product ${i}`,
      });
    }
    const result = await repo.findAll({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('findByDepartmentId returns products for the given department', async () => {
    await repo.create(baseProduct());
    await repo.create({
      ...baseProduct(),
      productCode: 'PROD002',
      upcCode: 'UPC0000002',
      productName: 'Product Two',
    });

    const results = await repo.findByDepartmentId(departmentId);
    expect(results).toHaveLength(2);
  });

  it('findBySubCategoryId returns products for the given sub-category', async () => {
    await repo.create(baseProduct());
    const results = await repo.findBySubCategoryId(subCategoryId);
    expect(results).toHaveLength(1);
    expect(results[0].productName).toBe('Test Product');
  });
});
