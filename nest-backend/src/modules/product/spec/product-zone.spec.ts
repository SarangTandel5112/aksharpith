import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductRepository } from '../product.repository';
import { ProductService } from '../product.service';
import { ProductController } from '../product.controller';
import { Product } from '../entities/product.entity';
import { ProductMedia } from '../entities/product-media.entity';
import { ProductPhysicalAttributes } from '../entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from '../entities/product-marketing-media.entity';
import { ProductZone } from '../entities/product-zone.entity';
import { ProductVendor } from '../entities/product-vendor.entity';
import { ProductGroupFieldValue } from '../entities/product-group-field-value.entity';
import { GroupField } from '../../product-group/entities/group-field.entity';

// ─── Shared fixtures ────────────────────────────────────────────────────────

const PRODUCT_ID = 'product-uuid-1';
const ZONE_ID = 'zone-uuid-1';

const mockZone: ProductZone = {
  id: ZONE_ID,
  productId: PRODUCT_ID,
  product: {} as Product,
  zoneName: 'North Zone',
  zoneCode: 'NZ',
  description: 'Northern distribution zone',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: null,
};

// ─── Repository-level mock factories ────────────────────────────────────────

const mockBaseRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(),
  delete: jest.fn(),
});

const mockMediaRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockPhysRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockMarketingMediaRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockZoneRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockVendorRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockGroupFieldValueRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

// ─── Repository tests ────────────────────────────────────────────────────────

describe('ProductRepository – zone methods', () => {
  let productRepo: ProductRepository;
  let zoneRepo: ReturnType<typeof mockZoneRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        { provide: getRepositoryToken(Product), useFactory: mockBaseRepo },
        {
          provide: getRepositoryToken(ProductMedia),
          useFactory: mockMediaRepo,
        },
        {
          provide: getRepositoryToken(ProductPhysicalAttributes),
          useFactory: mockPhysRepo,
        },
        {
          provide: getRepositoryToken(ProductMarketingMedia),
          useFactory: mockMarketingMediaRepo,
        },
        {
          provide: getRepositoryToken(ProductZone),
          useFactory: mockZoneRepo,
        },
        {
          provide: getRepositoryToken(ProductVendor),
          useFactory: mockVendorRepo,
        },
        {
          provide: getRepositoryToken(ProductGroupFieldValue),
          useFactory: mockGroupFieldValueRepo,
        },
        {
          provide: getRepositoryToken(GroupField),
          useFactory: () => ({ find: jest.fn() }),
        },
      ],
    }).compile();

    productRepo = module.get(ProductRepository);
    zoneRepo = module.get(getRepositoryToken(ProductZone));
  });

  afterEach(() => jest.clearAllMocks());

  describe('addZone', () => {
    it('creates and saves a zone with productId', async () => {
      const dto = { zoneName: 'North Zone', zoneCode: 'NZ' };
      zoneRepo.create.mockReturnValue({ ...dto, productId: PRODUCT_ID });
      zoneRepo.save.mockResolvedValue(mockZone);

      const result = await productRepo.addZone(PRODUCT_ID, dto as any);

      expect(zoneRepo.create).toHaveBeenCalledWith({
        ...dto,
        productId: PRODUCT_ID,
      });
      expect(zoneRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockZone);
    });
  });

  describe('getZones', () => {
    it('finds all zones for a product', async () => {
      zoneRepo.find.mockResolvedValue([mockZone]);

      const result = await productRepo.getZones(PRODUCT_ID);

      expect(zoneRepo.find).toHaveBeenCalledWith({
        where: { productId: PRODUCT_ID },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockZone);
    });

    it('returns empty array when no zones exist', async () => {
      zoneRepo.find.mockResolvedValue([]);

      const result = await productRepo.getZones(PRODUCT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('updateZone', () => {
    it('calls update with zoneId and dto', async () => {
      zoneRepo.update.mockResolvedValue({ affected: 1 });

      await productRepo.updateZone(ZONE_ID, { zoneName: 'Updated Zone' });

      expect(zoneRepo.update).toHaveBeenCalledWith(ZONE_ID, {
        zoneName: 'Updated Zone',
      });
    });
  });

  describe('removeZone', () => {
    it('returns true when zone deleted', async () => {
      zoneRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await productRepo.removeZone(ZONE_ID);

      expect(zoneRepo.delete).toHaveBeenCalledWith(ZONE_ID);
      expect(result).toBe(true);
    });

    it('returns false when zone not found', async () => {
      zoneRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await productRepo.removeZone('non-existent-id');

      expect(result).toBe(false);
    });
  });
});

// ─── Service tests ────────────────────────────────────────────────────────────

const mockProductRepoFactory = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  countByType: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  addMedia: jest.fn(),
  getMedia: jest.fn(),
  deleteMedia: jest.fn(),
  upsertPhysicalAttributes: jest.fn(),
  getPhysicalAttributes: jest.fn(),
  addMarketingMedia: jest.fn(),
  getMarketingMedia: jest.fn(),
  removeMarketingMedia: jest.fn(),
  addZone: jest.fn(),
  getZones: jest.fn(),
  updateZone: jest.fn(),
  removeZone: jest.fn(),
});

const mockProduct = {
  id: PRODUCT_ID,
  name: 'Shoe',
  sku: 'SKU-001',
  productType: 'simple',
  basePrice: 99.99,
  stockQuantity: 10,
  isActive: true,
  itemInactive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductService – zone methods', () => {
  let service: ProductService;
  let repo: ReturnType<typeof mockProductRepoFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useFactory: mockProductRepoFactory },
      ],
    }).compile();

    service = module.get(ProductService);
    repo = module.get(ProductRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('addZone', () => {
    it('validates product exists then delegates to repo', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.addZone.mockResolvedValue(mockZone);

      const result = await service.addZone(PRODUCT_ID, {
        zoneName: 'North Zone',
        zoneCode: 'NZ',
      });

      expect(repo.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(repo.addZone).toHaveBeenCalledWith(PRODUCT_ID, {
        zoneName: 'North Zone',
        zoneCode: 'NZ',
      });
      expect(result).toEqual(mockZone);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.addZone('bad-id', { zoneName: 'Zone' }),
      ).rejects.toThrow(NotFoundException);

      expect(repo.addZone).not.toHaveBeenCalled();
    });
  });

  describe('getZones', () => {
    it('validates product exists then returns zones', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.getZones.mockResolvedValue([mockZone]);

      const result = await service.getZones(PRODUCT_ID);

      expect(repo.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(repo.getZones).toHaveBeenCalledWith(PRODUCT_ID);
      expect(result).toEqual([mockZone]);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getZones('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateZone', () => {
    it('validates product exists then delegates update to repo', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.updateZone.mockResolvedValue(undefined);

      await service.updateZone(PRODUCT_ID, ZONE_ID, {
        zoneName: 'Updated Zone',
      });

      expect(repo.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(repo.updateZone).toHaveBeenCalledWith(ZONE_ID, {
        zoneName: 'Updated Zone',
      });
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateZone('bad-id', ZONE_ID, { zoneName: 'Updated Zone' }),
      ).rejects.toThrow(NotFoundException);

      expect(repo.updateZone).not.toHaveBeenCalled();
    });
  });

  describe('removeZone', () => {
    it('validates product, deletes zone successfully', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeZone.mockResolvedValue(true);

      await expect(
        service.removeZone(PRODUCT_ID, ZONE_ID),
      ).resolves.toBeUndefined();

      expect(repo.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(repo.removeZone).toHaveBeenCalledWith(ZONE_ID);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.removeZone('bad-id', ZONE_ID)).rejects.toThrow(
        NotFoundException,
      );

      expect(repo.removeZone).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when zone does not exist', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeZone.mockResolvedValue(false);

      await expect(
        service.removeZone(PRODUCT_ID, 'bad-zone-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

// ─── Controller tests ─────────────────────────────────────────────────────────

const mockServiceFactory = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  getStats: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addMedia: jest.fn(),
  getMedia: jest.fn(),
  deleteMedia: jest.fn(),
  upsertPhysicalAttributes: jest.fn(),
  getPhysicalAttributes: jest.fn(),
  addMarketingMedia: jest.fn(),
  getMarketingMedia: jest.fn(),
  removeMarketingMedia: jest.fn(),
  addZone: jest.fn(),
  getZones: jest.fn(),
  updateZone: jest.fn(),
  removeZone: jest.fn(),
});

describe('ProductController – zone endpoints', () => {
  let controller: ProductController;
  let service: ReturnType<typeof mockServiceFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useFactory: mockServiceFactory }],
    }).compile();

    controller = module.get(ProductController);
    service = module.get(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('GET :id/zones', () => {
    it('delegates to service.getZones and returns zones', async () => {
      service.getZones.mockResolvedValue([mockZone]);

      const result = await controller.getZones(PRODUCT_ID);

      expect(service.getZones).toHaveBeenCalledWith(PRODUCT_ID);
      expect(result).toEqual([mockZone]);
    });

    it('propagates NotFoundException from service', async () => {
      service.getZones.mockRejectedValue(new NotFoundException());

      await expect(controller.getZones('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('POST :id/zones', () => {
    it('delegates to service.addZone and returns created zone', async () => {
      service.addZone.mockResolvedValue(mockZone);
      const dto = { zoneName: 'North Zone', zoneCode: 'NZ' };

      const result = await controller.addZone(PRODUCT_ID, dto as any);

      expect(service.addZone).toHaveBeenCalledWith(PRODUCT_ID, dto);
      expect(result).toEqual(mockZone);
    });

    it('propagates NotFoundException from service', async () => {
      service.addZone.mockRejectedValue(new NotFoundException());

      await expect(
        controller.addZone('bad-id', { zoneName: 'Zone' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH :id/zones/:zoneId', () => {
    it('delegates to service.updateZone', async () => {
      service.updateZone.mockResolvedValue(undefined);
      const dto = { zoneName: 'Updated Zone' };

      await controller.updateZone(PRODUCT_ID, ZONE_ID, dto as any);

      expect(service.updateZone).toHaveBeenCalledWith(PRODUCT_ID, ZONE_ID, dto);
    });

    it('propagates NotFoundException when product not found', async () => {
      service.updateZone.mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateZone('bad-id', ZONE_ID, { zoneName: 'Zone' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE :id/zones/:zoneId', () => {
    it('delegates to service.removeZone and returns undefined', async () => {
      service.removeZone.mockResolvedValue(undefined);

      const result = await controller.removeZone(PRODUCT_ID, ZONE_ID);

      expect(service.removeZone).toHaveBeenCalledWith(PRODUCT_ID, ZONE_ID);
      expect(result).toBeUndefined();
    });

    it('propagates NotFoundException when zone not found', async () => {
      service.removeZone.mockRejectedValue(new NotFoundException());

      await expect(
        controller.removeZone(PRODUCT_ID, 'bad-zone-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
