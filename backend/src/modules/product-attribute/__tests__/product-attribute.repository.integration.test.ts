import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import {
  startPostgresContainer,
  createTestDataSource,
} from '../../../__tests__/setup/integration.setup';
import { ProductAttributeRepository } from '../product-attribute.repository';
import { ProductAttributeValueRepository } from '../product-attribute-value.repository';
import { ProductAttribute } from '@entities/product-attribute.entity';
import { ProductAttributeValue } from '@entities/product-attribute-value.entity';
import { Product } from '@entities/product.entity';
import { Department } from '@entities/department.entity';
import { ProductCategory } from '@entities/product-category.entity';
import { SubCategory } from '@entities/sub-category.entity';
import { ProductGroup } from '@entities/product-group.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let attrRepo: ProductAttributeRepository;
let valueRepo: ProductAttributeValueRepository;
let productId: number;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
}, 60000);

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE product_attribute_values RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE product_attributes RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE products RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE sub_categories RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE product_categories RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE product_groups RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE departments RESTART IDENTITY CASCADE');

  // Create required parent entities
  const deptRepo = dataSource.getRepository(Department);
  const dept = await deptRepo.save({ departmentName: 'Electronics', isActive: true });

  const catRepo = dataSource.getRepository(ProductCategory);
  const cat = await catRepo.save({ categoryName: 'Tech', isActive: true });

  const subCatRepo = dataSource.getRepository(SubCategory);
  const subCat = await subCatRepo.save({
    subCategoryName: 'Phones',
    categoryId: cat.id,
    isActive: true,
  });

  const groupRepo = dataSource.getRepository(ProductGroup);
  const group = await groupRepo.save({ groupName: 'Test Group', isActive: true });

  const productRepo = dataSource.getRepository(Product);
  const product = await productRepo.save({
    productCode: 'LM001',
    productName: 'Lot Matrix Product',
    productType: 'Lot Matrix',
    departmentId: dept.id,
    subCategoryId: subCat.id,
    groupId: group.id,
    hsnCode: '12345678',
    unitPrice: 99.99,
    isActive: true,
  });
  productId = product.id;

  attrRepo = new ProductAttributeRepository(dataSource.getRepository(ProductAttribute));
  valueRepo = new ProductAttributeValueRepository(dataSource.getRepository(ProductAttributeValue));
});

describe('ProductAttributeRepository', () => {
  it('creates and retrieves an attribute by id', async () => {
    const created = await attrRepo.create({
      productId,
      attributeName: 'Color',
      attributeCode: 'color',
      isRequired: true,
    });
    const found = await attrRepo.findById(created.id);
    expect(found?.attributeName).toBe('Color');
    expect(found?.attributeCode).toBe('color');
  });

  it('findById returns null for non-existent attribute', async () => {
    const found = await attrRepo.findById(9999);
    expect(found).toBeNull();
  });

  it('findByCode returns attribute when found', async () => {
    await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    const found = await attrRepo.findByCode(productId, 'color');
    expect(found?.attributeName).toBe('Color');
  });

  it('findByCode returns null for wrong product', async () => {
    await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    const found = await attrRepo.findByCode(9999, 'color');
    expect(found).toBeNull();
  });

  it('findByProductId returns all active attributes for a product', async () => {
    await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    await attrRepo.create({ productId, attributeName: 'Size', attributeCode: 'size' });

    const results = await attrRepo.findByProductId(productId);
    expect(results).toHaveLength(2);
  });

  it('findByProductId excludes soft-deleted attributes', async () => {
    const attr = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    await attrRepo.delete(attr.id);

    const results = await attrRepo.findByProductId(productId);
    expect(results).toHaveLength(0);
  });

  it('soft deletes an attribute', async () => {
    const created = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    const deleted = await attrRepo.delete(created.id);
    expect(deleted).toBe(true);
    const found = await attrRepo.findById(created.id);
    expect(found).toBeNull();
  });

  it('findByProductIdWithValues returns attributes with their values', async () => {
    const attr = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
    await valueRepo.create({ attributeId: attr.id, valueLabel: 'Blue', valueCode: 'blue' });

    const results = await attrRepo.findByProductIdWithValues(productId);
    expect(results).toHaveLength(1);
    expect(results[0].values).toHaveLength(2);
  });
});

describe('ProductAttributeValueRepository', () => {
  it('creates and retrieves a value by id', async () => {
    const attr = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    const created = await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
    const found = await valueRepo.findById(created.id);
    expect(found?.valueLabel).toBe('Red');
    expect(found?.valueCode).toBe('red');
  });

  it('findByAttributeId returns all active values for an attribute', async () => {
    const attr = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
    await valueRepo.create({ attributeId: attr.id, valueLabel: 'Blue', valueCode: 'blue' });

    const results = await valueRepo.findByAttributeId(attr.id);
    expect(results).toHaveLength(2);
  });

  it('findByCode returns value when found', async () => {
    const attr = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
    const found = await valueRepo.findByCode(attr.id, 'red');
    expect(found?.valueLabel).toBe('Red');
  });

  it('soft deletes a value', async () => {
    const attr = await attrRepo.create({ productId, attributeName: 'Color', attributeCode: 'color' });
    const val = await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
    const deleted = await valueRepo.delete(val.id);
    expect(deleted).toBe(true);
    const found = await valueRepo.findById(val.id);
    expect(found).toBeNull();
  });
});
