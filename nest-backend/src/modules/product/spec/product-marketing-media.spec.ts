import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductRepository } from '../product.repository';
import { ProductService } from '../product.service';
import { ProductController } from '../product.controller';
import { Product } from '../entities/product.entity';
import { ProductMedia } from '../entities/product-media.entity';
import { ProductPhysicalAttributes } from '../entities/product-physical-attributes.entity';
import { ProductMarketingMedia, MarketingMediaType } from '../entities/product-marketing-media.entity';
import { ProductZone } from '../entities/product-zone.entity';
import { ProductVendor } from '../entities/product-vendor.entity';
import { ProductGroupFieldValue } from '../entities/product-group-field-value.entity';
import { CreateMarketingMediaDto } from '../dto/create-marketing-media.dto';

// ─── Mock factory helpers ──────────────────────────────────────────────────

const mockRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

const mockMarketingMediaRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockProductRepoService = () => ({
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
  upsertGroupFieldValue: jest.fn(),
  getGroupFieldValues: jest.fn(),
  removeGroupFieldValue: jest.fn(),
  addVendor: jest.fn(),
  getVendors: jest.fn(),
  updateVendor: jest.fn(),
  removeVendor: jest.fn(),
});

const mockServiceForController = () => ({
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
  upsertGroupFieldValue: jest.fn(),
  getGroupFieldValues: jest.fn(),
  removeGroupFieldValue: jest.fn(),
  addVendor: jest.fn(),
  getVendors: jest.fn(),
  updateVendor: jest.fn(),
  removeVendor: jest.fn(),
});

const mockProduct = {
  id: 'prod-uuid-1',
  name: 'Test Product',
  sku: 'SKU-TEST',
  productType: 'simple',
  basePrice: 10.0,
  stockQuantity: 5,
  isActive: true,
  itemInactive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMarketingMedia: ProductMarketingMedia = {
  id: 'mm-uuid-1',
  productId: 'prod-uuid-1',
  product: mockProduct as any,
  mediaUrl: 'https://example.com/photo.jpg',
  mediaType: MarketingMediaType.PHOTO,
  displayOrder: 0,
  thumbnailUrl: null,
  duration: null,
  fileSize: null,
  createdAt: new Date(),
  updatedAt: null,
};

// ─── Repository tests ──────────────────────────────────────────────────────

describe('ProductRepository – marketing media', () => {
  let productRepo: ProductRepository;
  let marketingMediaRepo: ReturnType<typeof mockMarketingMediaRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        { provide: getRepositoryToken(Product), useFactory: mockRepo },
        { provide: getRepositoryToken(ProductMedia), useFactory: mockRepo },
        {
          provide: getRepositoryToken(ProductPhysicalAttributes),
          useFactory: () => ({ findOne: jest.fn(), create: jest.fn(), save: jest.fn() }),
        },
        {
          provide: getRepositoryToken(ProductMarketingMedia),
          useFactory: mockMarketingMediaRepo,
        },
        {
          provide: getRepositoryToken(ProductZone),
          useFactory: () => ({
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          }),
        },
        {
          provide: getRepositoryToken(ProductVendor),
          useFactory: () => ({
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          }),
        },
        {
          provide: getRepositoryToken(ProductGroupFieldValue),
          useFactory: () => ({
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          }),
        },
      ],
    }).compile();

    productRepo = module.get(ProductRepository);
    marketingMediaRepo = module.get(getRepositoryToken(ProductMarketingMedia));
  });

  afterEach(() => jest.clearAllMocks());

  describe('addMarketingMedia', () => {
    it('creates and saves marketing media', async () => {
      const dto: CreateMarketingMediaDto = { mediaUrl: 'https://example.com/photo.jpg' };
      marketingMediaRepo.create.mockReturnValue(mockMarketingMedia);
      marketingMediaRepo.save.mockResolvedValue(mockMarketingMedia);

      const result = await productRepo.addMarketingMedia('prod-uuid-1', dto);

      expect(marketingMediaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ mediaUrl: dto.mediaUrl, productId: 'prod-uuid-1' }),
      );
      expect(marketingMediaRepo.save).toHaveBeenCalledWith(mockMarketingMedia);
      expect(result).toEqual(mockMarketingMedia);
    });
  });

  describe('getMarketingMedia', () => {
    it('finds all marketing media by productId ordered by displayOrder', async () => {
      marketingMediaRepo.find.mockResolvedValue([mockMarketingMedia]);

      const result = await productRepo.getMarketingMedia('prod-uuid-1');

      expect(marketingMediaRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { productId: 'prod-uuid-1' } }),
      );
      expect(result).toEqual([mockMarketingMedia]);
    });

    it('returns empty array when no media exists', async () => {
      marketingMediaRepo.find.mockResolvedValue([]);
      const result = await productRepo.getMarketingMedia('prod-uuid-1');
      expect(result).toEqual([]);
    });
  });

  describe('removeMarketingMedia', () => {
    it('returns true when media is deleted', async () => {
      marketingMediaRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await productRepo.removeMarketingMedia('mm-uuid-1');
      expect(result).toBe(true);
    });

    it('returns false when media not found', async () => {
      marketingMediaRepo.delete.mockResolvedValue({ affected: 0 });
      const result = await productRepo.removeMarketingMedia('bad-id');
      expect(result).toBe(false);
    });
  });
});

// ─── Service tests ─────────────────────────────────────────────────────────

describe('ProductService – marketing media', () => {
  let service: ProductService;
  let repo: ReturnType<typeof mockProductRepoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useFactory: mockProductRepoService },
      ],
    }).compile();

    service = module.get(ProductService);
    repo = module.get(ProductRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('addMarketingMedia', () => {
    it('calls ensureProduct then delegates to repo', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.addMarketingMedia.mockResolvedValue(mockMarketingMedia);

      const dto: CreateMarketingMediaDto = { mediaUrl: 'https://example.com/photo.jpg' };
      const result = await service.addMarketingMedia('prod-uuid-1', dto);

      expect(repo.findById).toHaveBeenCalledWith('prod-uuid-1');
      expect(repo.addMarketingMedia).toHaveBeenCalledWith('prod-uuid-1', dto);
      expect(result).toEqual(mockMarketingMedia);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      const dto: CreateMarketingMediaDto = { mediaUrl: 'https://example.com/photo.jpg' };

      await expect(service.addMarketingMedia('bad-id', dto)).rejects.toThrow(NotFoundException);
      expect(repo.addMarketingMedia).not.toHaveBeenCalled();
    });
  });

  describe('getMarketingMedia', () => {
    it('validates product then returns media list', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.getMarketingMedia.mockResolvedValue([mockMarketingMedia]);

      const result = await service.getMarketingMedia('prod-uuid-1');

      expect(repo.findById).toHaveBeenCalledWith('prod-uuid-1');
      expect(repo.getMarketingMedia).toHaveBeenCalledWith('prod-uuid-1');
      expect(result).toEqual([mockMarketingMedia]);
    });

    it('throws NotFoundException when product missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getMarketingMedia('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMarketingMedia', () => {
    it('removes successfully when product and media exist', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeMarketingMedia.mockResolvedValue(true);

      await expect(
        service.removeMarketingMedia('prod-uuid-1', 'mm-uuid-1'),
      ).resolves.toBeUndefined();
    });

    it('throws NotFoundException when product missing', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.removeMarketingMedia('bad-prod', 'mm-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when media not found', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeMarketingMedia.mockResolvedValue(false);

      await expect(
        service.removeMarketingMedia('prod-uuid-1', 'bad-mm'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

// ─── Controller tests ──────────────────────────────────────────────────────

describe('ProductController – marketing media', () => {
  let controller: ProductController;
  let service: ReturnType<typeof mockServiceForController>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useFactory: mockServiceForController }],
    }).compile();

    controller = module.get(ProductController);
    service = module.get(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('GET :id/marketing-media', () => {
    it('delegates to service.getMarketingMedia and returns result', async () => {
      service.getMarketingMedia.mockResolvedValue([mockMarketingMedia]);

      const result = await controller.getMarketingMedia('prod-uuid-1');

      expect(service.getMarketingMedia).toHaveBeenCalledWith('prod-uuid-1');
      expect(result).toEqual([mockMarketingMedia]);
    });

    it('propagates NotFoundException from service', async () => {
      service.getMarketingMedia.mockRejectedValue(new NotFoundException());
      await expect(controller.getMarketingMedia('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST :id/marketing-media', () => {
    it('delegates to service.addMarketingMedia and returns created entity', async () => {
      const dto: CreateMarketingMediaDto = { mediaUrl: 'https://example.com/photo.jpg' };
      service.addMarketingMedia.mockResolvedValue(mockMarketingMedia);

      const result = await controller.addMarketingMedia('prod-uuid-1', dto);

      expect(service.addMarketingMedia).toHaveBeenCalledWith('prod-uuid-1', dto);
      expect(result).toEqual(mockMarketingMedia);
    });

    it('propagates NotFoundException when product not found', async () => {
      service.addMarketingMedia.mockRejectedValue(new NotFoundException());
      const dto: CreateMarketingMediaDto = { mediaUrl: 'https://example.com/photo.jpg' };
      await expect(controller.addMarketingMedia('bad-id', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE :id/marketing-media/:mediaId', () => {
    it('delegates to service.removeMarketingMedia and returns undefined', async () => {
      service.removeMarketingMedia.mockResolvedValue(undefined);

      const result = await controller.removeMarketingMedia('prod-uuid-1', 'mm-uuid-1');

      expect(service.removeMarketingMedia).toHaveBeenCalledWith('prod-uuid-1', 'mm-uuid-1');
      expect(result).toBeUndefined();
    });

    it('propagates NotFoundException when media not found', async () => {
      service.removeMarketingMedia.mockRejectedValue(new NotFoundException());
      await expect(
        controller.removeMarketingMedia('prod-uuid-1', 'bad-mm'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
