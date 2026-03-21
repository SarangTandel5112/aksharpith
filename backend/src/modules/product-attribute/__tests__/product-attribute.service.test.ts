import { ProductAttributeService } from '../product-attribute.service';
import { FakeProductAttributeRepository } from './fakes/fake-product-attribute.repository';
import { FakeProductAttributeValueRepository } from './fakes/fake-product-attribute-value.repository';
import { FakeProductRepository } from '../../product/__tests__/fakes/fake-product.repository';

function makeService() {
  const productRepo = new FakeProductRepository();
  const attrRepo = new FakeProductAttributeRepository();
  const valueRepo = new FakeProductAttributeValueRepository();
  const service = new ProductAttributeService(attrRepo, valueRepo, productRepo);
  return { service, productRepo, attrRepo, valueRepo };
}

async function makeLotMatrixProduct(productRepo: FakeProductRepository) {
  return productRepo.create({
    productType: 'Lot Matrix',
    productCode: 'LM001',
    productName: 'Lot Matrix Product',
    departmentId: 1,
    subCategoryId: 1,
    groupId: 1,
    hsnCode: '0000',
    unitPrice: 100,
  });
}

async function makeStandardProduct(productRepo: FakeProductRepository) {
  return productRepo.create({
    productType: 'Standard',
    productCode: 'STD001',
    productName: 'Standard Product',
    departmentId: 1,
    subCategoryId: 1,
    groupId: 1,
    hsnCode: '0000',
    unitPrice: 100,
  });
}

describe('ProductAttributeService', () => {
  describe('getAttributesByProduct', () => {
    it('returns attributes for the given product', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });
      await attrRepo.create({ productId: product.id, attributeName: 'Size', attributeCode: 'size' });

      const result = await service.getAttributesByProduct(product.id);
      expect(result).toHaveLength(2);
    });

    it('throws when product is not found', async () => {
      const { service } = makeService();
      await expect(service.getAttributesByProduct(999)).rejects.toThrow('Product not found');
    });
  });

  describe('getAttributeById', () => {
    it('returns the attribute when found', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });

      const result = await service.getAttributeById(attr.id);
      expect(result.id).toBe(attr.id);
      expect(result.attributeName).toBe('Color');
    });

    it('throws when attribute is not found', async () => {
      const { service } = makeService();
      await expect(service.getAttributeById(999)).rejects.toThrow('Product attribute not found');
    });
  });

  describe('createAttribute', () => {
    it('creates an attribute on a Lot Matrix product', async () => {
      const { service, productRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);

      const result = await service.createAttribute(product.id, {
        attributeName: 'Color',
        attributeCode: 'color',
      });
      expect(result.attributeName).toBe('Color');
      expect(result.productId).toBe(product.id);
    });

    it('throws when product is not found', async () => {
      const { service } = makeService();
      await expect(
        service.createAttribute(999, { attributeName: 'Color', attributeCode: 'color' })
      ).rejects.toThrow('Product not found');
    });

    it('throws when creating attribute on a Standard product', async () => {
      const { service, productRepo } = makeService();
      const product = await makeStandardProduct(productRepo);

      await expect(
        service.createAttribute(product.id, { attributeName: 'Color', attributeCode: 'color' })
      ).rejects.toThrow('Cannot add attributes to a Standard product');
    });

    it('throws when duplicate attributeCode exists on same product', async () => {
      const { service, productRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);

      await service.createAttribute(product.id, { attributeName: 'Color', attributeCode: 'color' });
      await expect(
        service.createAttribute(product.id, { attributeName: 'Color Alt', attributeCode: 'color' })
      ).rejects.toThrow("Attribute code 'color' already exists");
    });
  });

  describe('updateAttribute', () => {
    it('updates an existing attribute', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });

      const result = await service.updateAttribute(attr.id, { attributeName: 'Updated Color' });
      expect(result.attributeName).toBe('Updated Color');
    });

    it('throws when attribute is not found', async () => {
      const { service } = makeService();
      await expect(service.updateAttribute(999, { attributeName: 'Color' })).rejects.toThrow(
        'Product attribute not found'
      );
    });

    it('throws when updated code conflicts with another attribute', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });
      const attr2 = await attrRepo.create({ productId: product.id, attributeName: 'Size', attributeCode: 'size' });

      await expect(
        service.updateAttribute(attr2.id, { attributeCode: 'color' })
      ).rejects.toThrow("Attribute code 'color' already exists");
    });
  });

  describe('deleteAttribute', () => {
    it('soft-deletes an existing attribute', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });

      await service.deleteAttribute(attr.id);
      const found = await attrRepo.findById(attr.id);
      expect(found).toBeNull();
    });

    it('throws when attribute is not found', async () => {
      const { service } = makeService();
      await expect(service.deleteAttribute(999)).rejects.toThrow('Product attribute not found');
    });
  });

  describe('getAttributeValues', () => {
    it('returns values for an existing attribute', async () => {
      const { service, productRepo, attrRepo, valueRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });
      await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
      await valueRepo.create({ attributeId: attr.id, valueLabel: 'Blue', valueCode: 'blue' });

      const result = await service.getAttributeValues(attr.id);
      expect(result).toHaveLength(2);
    });

    it('throws when attribute is not found', async () => {
      const { service } = makeService();
      await expect(service.getAttributeValues(999)).rejects.toThrow('Product attribute not found');
    });
  });

  describe('createAttributeValue', () => {
    it('creates a value for an existing attribute', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });

      const result = await service.createAttributeValue(attr.id, {
        valueLabel: 'Red',
        valueCode: 'red',
      });
      expect(result.valueLabel).toBe('Red');
      expect(result.attributeId).toBe(attr.id);
    });

    it('throws when attribute is not found', async () => {
      const { service } = makeService();
      await expect(
        service.createAttributeValue(999, { valueLabel: 'Red', valueCode: 'red' })
      ).rejects.toThrow('Product attribute not found');
    });

    it('throws when duplicate valueCode exists on same attribute', async () => {
      const { service, productRepo, attrRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });

      await service.createAttributeValue(attr.id, { valueLabel: 'Red', valueCode: 'red' });
      await expect(
        service.createAttributeValue(attr.id, { valueLabel: 'Red Alt', valueCode: 'red' })
      ).rejects.toThrow("Attribute value code 'red' already exists");
    });
  });

  describe('updateAttributeValue', () => {
    it('updates an existing attribute value', async () => {
      const { service, productRepo, attrRepo, valueRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });
      const val = await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });

      const result = await service.updateAttributeValue(val.id, { valueLabel: 'Updated Red' });
      expect(result.valueLabel).toBe('Updated Red');
    });

    it('throws when value is not found', async () => {
      const { service } = makeService();
      await expect(service.updateAttributeValue(999, { valueLabel: 'Red' })).rejects.toThrow(
        'Attribute value not found'
      );
    });

    it('throws when updated code conflicts with another value on the same attribute', async () => {
      const { service, productRepo, attrRepo, valueRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });
      await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });
      const val2 = await valueRepo.create({ attributeId: attr.id, valueLabel: 'Blue', valueCode: 'blue' });

      await expect(
        service.updateAttributeValue(val2.id, { valueCode: 'red' })
      ).rejects.toThrow("Attribute value code 'red' already exists");
    });
  });

  describe('deleteAttributeValue', () => {
    it('soft-deletes an existing attribute value', async () => {
      const { service, productRepo, attrRepo, valueRepo } = makeService();
      const product = await makeLotMatrixProduct(productRepo);
      const attr = await attrRepo.create({ productId: product.id, attributeName: 'Color', attributeCode: 'color' });
      const val = await valueRepo.create({ attributeId: attr.id, valueLabel: 'Red', valueCode: 'red' });

      await service.deleteAttributeValue(val.id);
      const found = await valueRepo.findById(val.id);
      expect(found).toBeNull();
    });

    it('throws when value is not found', async () => {
      const { service } = makeService();
      await expect(service.deleteAttributeValue(999)).rejects.toThrow('Attribute value not found');
    });
  });
});
