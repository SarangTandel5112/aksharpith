import { ProductService } from '../product.service';
import { FakeProductRepository } from './fakes/fake-product.repository';
import { IProductMediaRepository } from '../interfaces/product-media.repository.interface';
import { IProductMarketingMediaRepository } from '../interfaces/product-marketing-media.repository.interface';
import { IProductPhysicalAttributesRepository } from '../interfaces/product-physical-attributes.repository.interface';
import { IProductZoneRepository } from '../interfaces/product-zone.repository.interface';
import { IProductVendorRepository } from '../interfaces/product-vendor.repository.interface';
import {
  IProductGroupFieldValueRepository,
  GroupFieldValueInput,
} from '../interfaces/product-group-field-value.repository.interface';
import { ProductMedia } from '@entities/product-media.entity';
import { ProductMarketingMedia } from '@entities/product-marketing-media.entity';
import { ProductPhysicalAttributes } from '@entities/product-physical-attributes.entity';
import { ProductZone } from '@entities/product-zone.entity';
import { ProductVendor } from '@entities/product-vendor.entity';
import { ProductGroupFieldValue } from '@entities/product-group-field-value.entity';

// ---- Inline fake repositories for sub-resources ----

class FakeMediaRepository implements IProductMediaRepository {
  store: ProductMedia[] = [];
  private nextId = 1;

  async findByProductId(pid: number): Promise<ProductMedia[]> {
    return this.store.filter((m) => m.productId === pid);
  }

  async create(data: Partial<ProductMedia>): Promise<ProductMedia> {
    const e = { id: this.nextId++, ...data } as ProductMedia;
    this.store.push(e);
    return e;
  }

  async findById(id: number): Promise<ProductMedia | null> {
    return this.store.find((m) => m.id === id) ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const i = this.store.findIndex((m) => m.id === id);
    if (i === -1) return false;
    this.store.splice(i, 1);
    return true;
  }
}

class FakeMarketingMediaRepository implements IProductMarketingMediaRepository {
  store: ProductMarketingMedia[] = [];
  private nextId = 1;

  async findByProductId(pid: number): Promise<ProductMarketingMedia[]> {
    return this.store.filter((m) => m.productId === pid);
  }

  async create(data: Partial<ProductMarketingMedia>): Promise<ProductMarketingMedia> {
    const e = { id: this.nextId++, ...data } as ProductMarketingMedia;
    this.store.push(e);
    return e;
  }

  async findById(id: number): Promise<ProductMarketingMedia | null> {
    return this.store.find((m) => m.id === id) ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const i = this.store.findIndex((m) => m.id === id);
    if (i === -1) return false;
    this.store.splice(i, 1);
    return true;
  }
}

class FakePhysicalAttributesRepository implements IProductPhysicalAttributesRepository {
  store: ProductPhysicalAttributes[] = [];
  private nextId = 1;

  async findByProductId(pid: number): Promise<ProductPhysicalAttributes | null> {
    return this.store.find((a) => a.productId === pid) ?? null;
  }

  async upsert(productId: number, data: Partial<ProductPhysicalAttributes>): Promise<ProductPhysicalAttributes> {
    const existing = this.store.find((a) => a.productId === productId);
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const e = { id: this.nextId++, productId, ...data } as ProductPhysicalAttributes;
    this.store.push(e);
    return e;
  }
}

class FakeZoneRepository implements IProductZoneRepository {
  store: ProductZone[] = [];
  private nextId = 1;

  async findByProductId(pid: number): Promise<ProductZone[]> {
    return this.store.filter((z) => z.productId === pid && z.isActive);
  }

  async upsert(productId: number, data: Partial<ProductZone>[]): Promise<ProductZone[]> {
    this.store.filter((z) => z.productId === productId).forEach((z) => {
      z.isActive = false;
    });
    const created = data.map((d) => {
      const e = { id: this.nextId++, productId, isActive: true, ...d } as ProductZone;
      this.store.push(e);
      return e;
    });
    return created;
  }
}

class FakeVendorRepository implements IProductVendorRepository {
  store: ProductVendor[] = [];
  private nextId = 1;

  async findByProductId(pid: number): Promise<ProductVendor[]> {
    return this.store.filter((v) => v.productId === pid && v.isActive);
  }

  async create(data: Partial<ProductVendor>): Promise<ProductVendor> {
    const e = { id: this.nextId++, isActive: true, ...data } as ProductVendor;
    this.store.push(e);
    return e;
  }

  async findById(id: number): Promise<ProductVendor | null> {
    return this.store.find((v) => v.id === id) ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const i = this.store.findIndex((v) => v.id === id);
    if (i === -1) return false;
    this.store.splice(i, 1);
    return true;
  }
}

class FakeGroupFieldValueRepository implements IProductGroupFieldValueRepository {
  store: ProductGroupFieldValue[] = [];
  private nextId = 1;

  async findByProductId(pid: number): Promise<ProductGroupFieldValue[]> {
    return this.store.filter((v) => v.productId === pid && v.isActive);
  }

  async deleteByProductId(productId: number): Promise<void> {
    this.store.filter((v) => v.productId === productId).forEach((v) => {
      v.isActive = false;
    });
  }

  async createMany(productId: number, values: GroupFieldValueInput[]): Promise<ProductGroupFieldValue[]> {
    const created = values.map((v) => {
      const e = { id: this.nextId++, productId, isActive: true, ...v } as ProductGroupFieldValue;
      this.store.push(e);
      return e;
    });
    return created;
  }
}

// ---- Test helpers ----

const VALID_PRODUCT = {
  productCode: 'PROD001',
  upcCode: 'UPC0000001',
  productName: 'Test Product',
  productType: 'Standard' as const,
  departmentId: 1,
  subCategoryId: 1,
  groupId: 1,
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
  let mediaRepo: FakeMediaRepository;
  let marketingMediaRepo: FakeMarketingMediaRepository;
  let physicalAttributesRepo: FakePhysicalAttributesRepository;
  let zoneRepo: FakeZoneRepository;
  let vendorRepo: FakeVendorRepository;
  let groupFieldValueRepo: FakeGroupFieldValueRepository;

  beforeEach(() => {
    repo = new FakeProductRepository();
    mediaRepo = new FakeMediaRepository();
    marketingMediaRepo = new FakeMarketingMediaRepository();
    physicalAttributesRepo = new FakePhysicalAttributesRepository();
    zoneRepo = new FakeZoneRepository();
    vendorRepo = new FakeVendorRepository();
    groupFieldValueRepo = new FakeGroupFieldValueRepository();
    service = new ProductService(
      repo,
      mediaRepo,
      marketingMediaRepo,
      physicalAttributesRepo,
      zoneRepo,
      vendorRepo,
      groupFieldValueRepo
    );
  });

  describe('getAllProducts', () => {
    it('returns paginated products', async () => {
      await repo.create({
        ...VALID_PRODUCT,
        productName: 'Product A',
        productCode: 'PA001',
      });
      await repo.create({
        ...VALID_PRODUCT,
        productName: 'Product B',
        productCode: 'PB002',
      });
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
      await expect(service.getProductById(999)).rejects.toThrow(
        'Product not found'
      );
    });

    it('throws when product is soft-deleted', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await repo.delete(product.id);
      await expect(service.getProductById(product.id)).rejects.toThrow(
        'Product not found'
      );
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
        service.createProduct({
          ...VALID_PRODUCT,
          productName: 'Different Name',
        })
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
      await repo.create({
        ...VALID_PRODUCT,
        productName: 'Other Product',
        productCode: 'OTHER01',
      });
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
      await expect(service.deleteProduct(999)).rejects.toThrow(
        'Product not found'
      );
    });
  });

  describe('getProductCount', () => {
    it('returns count of active products', async () => {
      await repo.create({
        ...VALID_PRODUCT,
        productCode: 'P001',
        productName: 'Product 1',
      });
      await repo.create({
        ...VALID_PRODUCT,
        productCode: 'P002',
        productName: 'Product 2',
      });
      const count = await service.getProductCount();
      expect(count).toBe(2);
    });
  });

  // ---- Sub-resource tests ----

  describe('getProductMedia', () => {
    it('returns empty array when no media', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const result = await service.getProductMedia(product.id);
      expect(result).toEqual([]);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.getProductMedia(999)).rejects.toThrow('Product not found');
    });

    it('returns media for the product', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await mediaRepo.create({ productId: product.id, mediaUrl: 'http://example.com/img.jpg', mediaType: 'photo', displayOrder: 0, isPrimary: true });
      const result = await service.getProductMedia(product.id);
      expect(result).toHaveLength(1);
      expect(result[0].mediaUrl).toBe('http://example.com/img.jpg');
    });
  });

  describe('addProductMedia', () => {
    it('adds media to a product', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const media = await service.addProductMedia(product.id, {
        productId: product.id,
        mediaUrl: 'http://example.com/img.jpg',
        mediaType: 'photo',
        displayOrder: 0,
        isPrimary: false,
      });
      expect(media.productId).toBe(product.id);
      expect(media.mediaUrl).toBe('http://example.com/img.jpg');
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(
        service.addProductMedia(999, { mediaUrl: 'http://x.com', mediaType: 'photo' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProductMedia', () => {
    it('deletes media by id', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const media = await mediaRepo.create({ productId: product.id, mediaUrl: 'http://example.com', mediaType: 'photo', displayOrder: 0, isPrimary: false });
      await service.deleteProductMedia(product.id, media.id);
      expect(await mediaRepo.findById(media.id)).toBeNull();
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.deleteProductMedia(999, 1)).rejects.toThrow('Product not found');
    });

    it('throws Media not found when media does not exist', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await expect(service.deleteProductMedia(product.id, 999)).rejects.toThrow('Media not found');
    });
  });

  describe('getProductMarketingMedia', () => {
    it('returns empty array when no marketing media', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const result = await service.getProductMarketingMedia(product.id);
      expect(result).toEqual([]);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.getProductMarketingMedia(999)).rejects.toThrow('Product not found');
    });
  });

  describe('addProductMarketingMedia', () => {
    it('adds marketing media to a product', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const media = await service.addProductMarketingMedia(product.id, {
        productId: product.id,
        mediaUrl: 'http://example.com/video.mp4',
        mediaType: 'video',
        displayOrder: 0,
      });
      expect(media.productId).toBe(product.id);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(
        service.addProductMarketingMedia(999, { mediaUrl: 'http://x.com', mediaType: 'video' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProductMarketingMedia', () => {
    it('deletes marketing media by id', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const media = await marketingMediaRepo.create({ productId: product.id, mediaUrl: 'http://example.com', mediaType: 'video', displayOrder: 0 });
      await service.deleteProductMarketingMedia(product.id, media.id);
      expect(await marketingMediaRepo.findById(media.id)).toBeNull();
    });

    it('throws Marketing media not found when media does not exist', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await expect(service.deleteProductMarketingMedia(product.id, 999)).rejects.toThrow('Marketing media not found');
    });
  });

  describe('getProductPhysicalAttributes', () => {
    it('returns null when no physical attributes', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const result = await service.getProductPhysicalAttributes(product.id);
      expect(result).toBeNull();
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.getProductPhysicalAttributes(999)).rejects.toThrow('Product not found');
    });
  });

  describe('upsertProductPhysicalAttributes', () => {
    it('creates physical attributes when none exist', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const attrs = await service.upsertProductPhysicalAttributes(product.id, { weight: '500 gm' });
      expect(attrs.productId).toBe(product.id);
      expect(attrs.weight).toBe('500 gm');
    });

    it('updates existing physical attributes', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await physicalAttributesRepo.upsert(product.id, { weight: '100 gm' });
      const updated = await service.upsertProductPhysicalAttributes(product.id, { weight: '200 gm' });
      expect(updated.weight).toBe('200 gm');
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(
        service.upsertProductPhysicalAttributes(999, { weight: '100 gm' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('getProductZones', () => {
    it('returns empty array when no zones', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const result = await service.getProductZones(product.id);
      expect(result).toEqual([]);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.getProductZones(999)).rejects.toThrow('Product not found');
    });
  });

  describe('upsertProductZones', () => {
    it('replaces zones for a product', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await zoneRepo.upsert(product.id, [{ zoneName: 'Zone A', zoneCode: 'ZA' }]);
      const result = await service.upsertProductZones(product.id, [
        { zoneName: 'Zone B', zoneCode: 'ZB' },
        { zoneName: 'Zone C', zoneCode: 'ZC' },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].zoneName).toBe('Zone B');
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(
        service.upsertProductZones(999, [{ zoneName: 'Zone A' }])
      ).rejects.toThrow('Product not found');
    });
  });

  describe('getProductVendors', () => {
    it('returns empty array when no vendors', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const result = await service.getProductVendors(product.id);
      expect(result).toEqual([]);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.getProductVendors(999)).rejects.toThrow('Product not found');
    });
  });

  describe('addProductVendor', () => {
    it('adds a vendor to a product', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const vendor = await service.addProductVendor(product.id, {
        productId: product.id,
        vendorName: 'ACME Corp',
        isPrimary: false,
      });
      expect(vendor.vendorName).toBe('ACME Corp');
      expect(vendor.productId).toBe(product.id);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(
        service.addProductVendor(999, { vendorName: 'X Corp' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProductVendor', () => {
    it('deletes a vendor by id', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const vendor = await vendorRepo.create({ productId: product.id, vendorName: 'ACME', isPrimary: false });
      await service.deleteProductVendor(product.id, vendor.id);
      expect(await vendorRepo.findById(vendor.id)).toBeNull();
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.deleteProductVendor(999, 1)).rejects.toThrow('Product not found');
    });

    it('throws Vendor not found when vendor does not exist', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await expect(service.deleteProductVendor(product.id, 999)).rejects.toThrow('Vendor not found');
    });
  });

  describe('getGroupFieldValues', () => {
    it('returns empty array when no group field values', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      const result = await service.getGroupFieldValues(product.id);
      expect(result).toEqual([]);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(service.getGroupFieldValues(999)).rejects.toThrow('Product not found');
    });
  });

  describe('upsertGroupFieldValues', () => {
    it('replaces all group field values for a product', async () => {
      const product = await repo.create({ ...VALID_PRODUCT });
      await groupFieldValueRepo.createMany(product.id, [{ fieldId: 1, valueText: 'old' }]);
      const result = await service.upsertGroupFieldValues(product.id, [
        { fieldId: 2, valueText: 'new' },
        { fieldId: 3, valueNumber: 42 },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].fieldId).toBe(2);
    });

    it('throws Product not found when product does not exist', async () => {
      await expect(
        service.upsertGroupFieldValues(999, [{ fieldId: 1 }])
      ).rejects.toThrow('Product not found');
    });
  });
});
