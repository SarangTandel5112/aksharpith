import { ProductVariantService } from '../product-variant.service';
import { FakeProductVariantRepository } from './fakes/fake-product-variant.repository';
import { FakeProductRepository } from '@modules/product/__tests__/fakes/fake-product.repository';

async function setupProductWithAttributes() {
  const productRepo = new FakeProductRepository();
  const variantRepo = new FakeProductVariantRepository();

  const product = await productRepo.create({
    productType: 'Lot Matrix',
    productCode: 'P001',
    productName: 'Test Product',
    departmentId: 1,
    subCategoryId: 1,
    groupId: 1,
    hsnCode: '0000',
    unitPrice: 100,
  });

  // Manually attach attributes with values (bypass fake repo for simplicity)
  product.attributes = [
    {
      id: 1,
      productId: product.id,
      attributeName: 'Color',
      attributeCode: 'color',
      isActive: true,
      isRequired: true,
      displayOrder: null,
      createdAt: new Date(),
      values: [
        {
          id: 1,
          attributeId: 1,
          valueLabel: 'Red',
          valueCode: 'red',
          isActive: true,
          displayOrder: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          attributeId: 1,
          valueLabel: 'Blue',
          valueCode: 'blue',
          isActive: true,
          displayOrder: null,
          createdAt: new Date(),
        },
      ],
    } as any,
    {
      id: 2,
      productId: product.id,
      attributeName: 'Size',
      attributeCode: 'size',
      isActive: true,
      isRequired: true,
      displayOrder: null,
      createdAt: new Date(),
      values: [
        {
          id: 3,
          attributeId: 2,
          valueLabel: 'S',
          valueCode: 's',
          isActive: true,
          displayOrder: null,
          createdAt: new Date(),
        },
        {
          id: 4,
          attributeId: 2,
          valueLabel: 'M',
          valueCode: 'm',
          isActive: true,
          displayOrder: null,
          createdAt: new Date(),
        },
      ],
    } as any,
  ];

  const service = new ProductVariantService(variantRepo, productRepo);
  return { productRepo, variantRepo, service, product };
}

describe('ProductVariantService', () => {
  describe('getVariantsByProduct', () => {
    it('returns variants for a valid product', async () => {
      const { productRepo, variantRepo, service, product } =
        await setupProductWithAttributes();
      await variantRepo.create({
        productId: product.id,
        sku: 'P001-1_3',
        combinationHash: '1_3',
      });
      const variants = await service.getVariantsByProduct(product.id);
      expect(variants).toHaveLength(1);
    });

    it('throws Product not found for non-existent product', async () => {
      const { service } = await setupProductWithAttributes();
      await expect(service.getVariantsByProduct(9999)).rejects.toThrow(
        'Product not found'
      );
    });
  });

  describe('getVariantById', () => {
    it('returns variant when found', async () => {
      const { variantRepo, service } = await setupProductWithAttributes();
      const variant = await variantRepo.create({
        productId: 1,
        sku: 'P001-1_3',
        combinationHash: '1_3',
      });
      const found = await service.getVariantById(variant.id);
      expect(found.id).toBe(variant.id);
    });

    it('throws Product variant not found when not found', async () => {
      const { service } = await setupProductWithAttributes();
      await expect(service.getVariantById(9999)).rejects.toThrow(
        'Product variant not found'
      );
    });
  });

  describe('generateVariants', () => {
    it('throws for Standard product type', async () => {
      const productRepo = new FakeProductRepository();
      const variantRepo = new FakeProductVariantRepository();
      const product = await productRepo.create({
        productType: 'Standard',
        productCode: 'S001',
        productName: 'Standard Product',
        departmentId: 1,
        subCategoryId: 1,
        hsnCode: '0000',
        unitPrice: 50,
      });
      const service = new ProductVariantService(variantRepo, productRepo);
      await expect(service.generateVariants(product.id)).rejects.toThrow(
        'Cannot generate variants for a Standard product'
      );
    });

    it('throws when product has no attributes', async () => {
      const productRepo = new FakeProductRepository();
      const variantRepo = new FakeProductVariantRepository();
      const product = await productRepo.create({
        productType: 'Lot Matrix',
        productCode: 'LM001',
        productName: 'Lot Matrix Product',
        departmentId: 1,
        subCategoryId: 1,
        hsnCode: '0000',
        unitPrice: 50,
      });
      product.attributes = [];
      const service = new ProductVariantService(variantRepo, productRepo);
      await expect(service.generateVariants(product.id)).rejects.toThrow(
        'Product must have at least one attribute'
      );
    });

    it('generates 4 variants for 2 attributes × 2 values each', async () => {
      const { service, product } = await setupProductWithAttributes();
      const created = await service.generateVariants(product.id);
      expect(created).toHaveLength(4);
    });

    it('assigns unique combination hashes', async () => {
      const { service, product } = await setupProductWithAttributes();
      const created = await service.generateVariants(product.id);
      const hashes = created.map((v) => v.combinationHash);
      const unique = new Set(hashes);
      expect(unique.size).toBe(4);
    });

    it('skips existing combinations on second call', async () => {
      const { service, product } = await setupProductWithAttributes();
      const firstBatch = await service.generateVariants(product.id);
      expect(firstBatch).toHaveLength(4);
      const secondBatch = await service.generateVariants(product.id);
      expect(secondBatch).toHaveLength(0);
    });
  });

  describe('createVariant', () => {
    it('creates a variant with the correct combination hash', async () => {
      const { service, product } = await setupProductWithAttributes();
      const variant = await service.createVariant(product.id, {
        sku: 'P001-MANUAL-1_3',
        attributeValueIds: [3, 1],
      });
      expect(variant.sku).toBe('P001-MANUAL-1_3');
      expect(variant.combinationHash).toBe('1_3');
    });

    it('throws when SKU already exists', async () => {
      const { service, product } = await setupProductWithAttributes();
      await service.createVariant(product.id, {
        sku: 'P001-DUPE',
        attributeValueIds: [1, 3],
      });
      await expect(
        service.createVariant(product.id, {
          sku: 'P001-DUPE',
          attributeValueIds: [2, 4],
        })
      ).rejects.toThrow('Product variant SKU already exists');
    });
  });

  describe('updateVariant', () => {
    it('updates an existing variant', async () => {
      const { variantRepo, service } = await setupProductWithAttributes();
      const variant = await variantRepo.create({
        productId: 1,
        sku: 'P001-UPD',
        combinationHash: '1_3',
      });
      const updated = await service.updateVariant(variant.id, {
        sku: 'P001-UPDATED',
        stockQuantity: 10,
      });
      expect(updated.sku).toBe('P001-UPDATED');
      expect(updated.stockQuantity).toBe(10);
    });

    it('throws Product variant not found for non-existent variant', async () => {
      const { service } = await setupProductWithAttributes();
      await expect(
        service.updateVariant(9999, { sku: 'NOPE' })
      ).rejects.toThrow('Product variant not found');
    });
  });

  describe('deleteVariant', () => {
    it('soft-deletes an existing variant', async () => {
      const { variantRepo, service } = await setupProductWithAttributes();
      const variant = await variantRepo.create({
        productId: 1,
        sku: 'P001-DEL',
        combinationHash: '2_4',
      });
      await service.deleteVariant(variant.id);
      const found = await variantRepo.findById(variant.id);
      expect(found).toBeNull();
    });

    it('throws Product variant not found for non-existent variant', async () => {
      const { service } = await setupProductWithAttributes();
      await expect(service.deleteVariant(9999)).rejects.toThrow(
        'Product variant not found'
      );
    });
  });
});
