import { ProductService } from '../product.service';
import { FakeProductRepository } from './fakes/fake-product.repository';

const VALID_PRODUCT = {
  productCode: 'PROD001',
  upcCode: 'UPC0000001',
  productName: 'Test Product',
  productType: 'Standard' as const,
  departmentId: 1,
  subCategoryId: 1,
  hsnCode: '12345678',
  nonTaxable: false,
  itemInactive: false,
  nonStockItem: false,
  unitPrice: 99.99,
  stockQuantity: 10,
};

describe('ProductService', () => {
  let service: ProductService;
  let repo: FakeProductRepository;

  beforeEach(() => {
    repo = new FakeProductRepository();
    service = new ProductService(repo);
  });

  describe('getAllProducts', () => {
    it('returns paginated products', async () => {
      await repo.create({ ...VALID_PRODUCT, productName: 'Product A', productCode: 'PA001' });
      await repo.create({ ...VALID_PRODUCT, productName: 'Product B', productCode: 'PB002' });
      const result = await service.getAllProducts({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('excludes soft-deleted products', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await repo.delete(product.id);
      const result = await service.getAllProducts({});
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getProductById', () => {
    it('returns product when found', async () => {
      const created = await repo.create({ ...VALID_PRODUCT });
      const found = await service.getProductById(created.id);
      expect(found.productName).toBe(VALID_PRODUCT.productName);
    });

    it('throws when product not found', async () => {
      await expect(service.getProductById(999)).rejects.toThrow('Product not found');
    });

    it('throws when product is soft-deleted', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await repo.delete(product.id);
      await expect(service.getProductById(product.id)).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('creates a product successfully', async () => {
      const product = await service.createProduct(VALID_PRODUCT);
      expect(product.productName).toBe(VALID_PRODUCT.productName);
      expect(product.productCode).toBe(VALID_PRODUCT.productCode);
    });

    it('throws when product code already exists', async () => {
      await repo.create({ ...VALID_PRODUCT });
      await expect(
        service.createProduct({ ...VALID_PRODUCT, productName: 'Different Name' })
      ).rejects.toThrow('already exists');
    });

    it('throws when product name already exists', async () => {
      await repo.create({ ...VALID_PRODUCT });
      await expect(
        service.createProduct({ ...VALID_PRODUCT, productCode: 'NEWCODE1' })
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateProduct', () => {
    it('updates product successfully', async () => {
      const created = await repo.create({ ...VALID_PRODUCT });
      const updated = await service.updateProduct(created.id, {
        productName: 'Updated Name',
      });
      expect(updated.productName).toBe('Updated Name');
    });

    it('throws when product not found', async () => {
      await expect(
        service.updateProduct(999, { productName: 'New Name' })
      ).rejects.toThrow('Product not found');
    });

    it('throws when productCode conflicts with another product', async () => {
      await repo.create({ ...VALID_PRODUCT, productName: 'Other Product', productCode: 'OTHER01' });
      const product2 = await repo.create({
        ...VALID_PRODUCT,
        productName: 'My Product',
        productCode: 'MINE001',
      });
      await expect(
        service.updateProduct(product2.id, { productCode: 'OTHER01' })
      ).rejects.toThrow('already exists');
    });

    it('allows updating product with its own productCode', async () => {
      const created = await repo.create({ ...VALID_PRODUCT });
      const updated = await service.updateProduct(created.id, {
        productCode: VALID_PRODUCT.productCode,
        description: 'Updated description',
      });
      expect(updated.productCode).toBe(VALID_PRODUCT.productCode);
    });
  });

  describe('deleteProduct', () => {
    it('soft-deletes a product', async () => {
      const created = await repo.create({ ...VALID_PRODUCT });
      await service.deleteProduct(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('throws when product not found', async () => {
      await expect(service.deleteProduct(999)).rejects.toThrow('Product not found');
    });
  });

  describe('getProductCount', () => {
    it('returns count of active products', async () => {
      await repo.create({ ...VALID_PRODUCT, productCode: 'P001', productName: 'Product 1' });
      await repo.create({ ...VALID_PRODUCT, productCode: 'P002', productName: 'Product 2' });
      const count = await service.getProductCount();
      expect(count).toBe(2);
    });
  });
});
