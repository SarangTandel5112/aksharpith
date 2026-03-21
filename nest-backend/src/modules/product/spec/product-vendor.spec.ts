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
import { GroupFieldOption } from '../../product-group/entities/group-field-option.entity';
import { CreateProductVendorDto } from '../dto/create-product-vendor.dto';

// ─── mock factories ──────────────────────────────────────────────────────────

const mockOrmRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockProductServiceRepo = () => ({
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

const mockProduct = {
  id: 'prod-uuid-1',
  name: 'Test Product',
  sku: 'SKU-TEST-001',
  productType: 'simple',
  basePrice: 100,
  stockQuantity: 5,
  isActive: true,
  itemInactive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVendor: ProductVendor = {
  id: 'vendor-uuid-1',
  productId: 'prod-uuid-1',
  product: mockProduct as unknown as Product,
  vendorName: 'Acme Supplies',
  contactPerson: 'John Doe',
  contactEmail: 'john@acme.com',
  contactPhone: '+1-555-0100',
  gstin: 'GSTIN123456',
  address: '123 Main St',
  isPrimary: true,
  notes: 'Preferred vendor',
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
};

const createVendorDto: CreateProductVendorDto = {
  vendorName: 'Acme Supplies',
  contactPerson: 'John Doe',
  contactEmail: 'john@acme.com',
  isPrimary: true,
};

// ─── ProductRepository vendor methods ────────────────────────────────────────

describe('ProductRepository – vendor sub-resource', () => {
  let productRepo: ProductRepository;
  let vendorRepo: ReturnType<typeof mockOrmRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        { provide: getRepositoryToken(Product), useFactory: mockOrmRepo },
        { provide: getRepositoryToken(ProductMedia), useFactory: mockOrmRepo },
        {
          provide: getRepositoryToken(ProductPhysicalAttributes),
          useFactory: mockOrmRepo,
        },
        {
          provide: getRepositoryToken(ProductMarketingMedia),
          useFactory: mockOrmRepo,
        },
        { provide: getRepositoryToken(ProductZone), useFactory: mockOrmRepo },
        {
          provide: getRepositoryToken(ProductVendor),
          useFactory: mockOrmRepo,
        },
        {
          provide: getRepositoryToken(ProductGroupFieldValue),
          useFactory: mockOrmRepo,
        },
        { provide: getRepositoryToken(GroupField), useFactory: mockOrmRepo },
        {
          provide: getRepositoryToken(GroupFieldOption),
          useFactory: mockOrmRepo,
        },
      ],
    }).compile();

    productRepo = module.get(ProductRepository);
    vendorRepo = module.get(getRepositoryToken(ProductVendor));
  });

  afterEach(() => jest.clearAllMocks());

  describe('addVendor', () => {
    it('creates and saves a vendor', async () => {
      vendorRepo.create.mockReturnValue(mockVendor);
      vendorRepo.save.mockResolvedValue(mockVendor);

      const result = await productRepo.addVendor(
        'prod-uuid-1',
        createVendorDto,
      );

      expect(vendorRepo.create).toHaveBeenCalledWith({
        ...createVendorDto,
        productId: 'prod-uuid-1',
      });
      expect(vendorRepo.save).toHaveBeenCalledWith(mockVendor);
      expect(result).toEqual(mockVendor);
    });
  });

  describe('getVendors', () => {
    it('returns all vendors for a product', async () => {
      vendorRepo.find.mockResolvedValue([mockVendor]);

      const result = await productRepo.getVendors('prod-uuid-1');

      expect(vendorRepo.find).toHaveBeenCalledWith({
        where: { productId: 'prod-uuid-1' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockVendor);
    });

    it('returns empty array when no vendors exist', async () => {
      vendorRepo.find.mockResolvedValue([]);
      const result = await productRepo.getVendors('prod-uuid-1');
      expect(result).toEqual([]);
    });
  });

  describe('updateVendor', () => {
    it('calls update with the correct vendorId and dto', async () => {
      vendorRepo.update.mockResolvedValue({ affected: 1 });

      await productRepo.updateVendor('vendor-uuid-1', { vendorName: 'New Name' });

      expect(vendorRepo.update).toHaveBeenCalledWith('vendor-uuid-1', {
        vendorName: 'New Name',
      });
    });
  });

  describe('removeVendor', () => {
    it('returns true when vendor is deleted', async () => {
      vendorRepo.delete.mockResolvedValue({ affected: 1 });
      expect(await productRepo.removeVendor('vendor-uuid-1')).toBe(true);
    });

    it('returns false when vendor is not found', async () => {
      vendorRepo.delete.mockResolvedValue({ affected: 0 });
      expect(await productRepo.removeVendor('bad-uuid')).toBe(false);
    });
  });
});

// ─── ProductService vendor methods ───────────────────────────────────────────

describe('ProductService – vendor sub-resource', () => {
  let service: ProductService;
  let repo: ReturnType<typeof mockProductServiceRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useFactory: mockProductServiceRepo },
      ],
    }).compile();

    service = module.get(ProductService);
    repo = module.get(ProductRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('addVendor', () => {
    it('checks product existence then delegates to repo', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.addVendor.mockResolvedValue(mockVendor);

      const result = await service.addVendor('prod-uuid-1', createVendorDto);

      expect(repo.findById).toHaveBeenCalledWith('prod-uuid-1');
      expect(repo.addVendor).toHaveBeenCalledWith('prod-uuid-1', createVendorDto);
      expect(result).toEqual(mockVendor);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.addVendor('bad-prod', createVendorDto),
      ).rejects.toThrow(NotFoundException);

      expect(repo.addVendor).not.toHaveBeenCalled();
    });
  });

  describe('getVendors', () => {
    it('checks product existence then returns vendor list', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.getVendors.mockResolvedValue([mockVendor]);

      const result = await service.getVendors('prod-uuid-1');

      expect(repo.findById).toHaveBeenCalledWith('prod-uuid-1');
      expect(result).toEqual([mockVendor]);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getVendors('bad-prod')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVendor', () => {
    it('checks product existence then delegates update', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.updateVendor.mockResolvedValue(undefined);

      await service.updateVendor('prod-uuid-1', 'vendor-uuid-1', {
        vendorName: 'Updated Name',
      });

      expect(repo.findById).toHaveBeenCalledWith('prod-uuid-1');
      expect(repo.updateVendor).toHaveBeenCalledWith('vendor-uuid-1', {
        vendorName: 'Updated Name',
      });
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateVendor('bad-prod', 'vendor-uuid-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeVendor', () => {
    it('removes vendor successfully', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeVendor.mockResolvedValue(true);

      await expect(
        service.removeVendor('prod-uuid-1', 'vendor-uuid-1'),
      ).resolves.toBeUndefined();

      expect(repo.removeVendor).toHaveBeenCalledWith('vendor-uuid-1');
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.removeVendor('bad-prod', 'vendor-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when vendor does not exist', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeVendor.mockResolvedValue(false);

      await expect(
        service.removeVendor('prod-uuid-1', 'bad-vendor'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

// ─── ProductController vendor endpoints ──────────────────────────────────────

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
  upsertGroupFieldValue: jest.fn(),
  getGroupFieldValues: jest.fn(),
  removeGroupFieldValue: jest.fn(),
  addVendor: jest.fn(),
  getVendors: jest.fn(),
  updateVendor: jest.fn(),
  removeVendor: jest.fn(),
});

describe('ProductController – vendor endpoints', () => {
  let controller: ProductController;
  let service: ReturnType<typeof mockServiceFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useFactory: mockServiceFactory },
      ],
    }).compile();

    controller = module.get(ProductController);
    service = module.get(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getVendors delegates to service and returns result', async () => {
    service.getVendors.mockResolvedValue([mockVendor]);

    const result = await controller.getVendors('prod-uuid-1');

    expect(service.getVendors).toHaveBeenCalledWith('prod-uuid-1');
    expect(result).toEqual([mockVendor]);
  });

  it('addVendor delegates to service and returns created vendor', async () => {
    service.addVendor.mockResolvedValue(mockVendor);

    const result = await controller.addVendor('prod-uuid-1', createVendorDto);

    expect(service.addVendor).toHaveBeenCalledWith(
      'prod-uuid-1',
      createVendorDto,
    );
    expect(result).toEqual(mockVendor);
  });

  it('updateVendor delegates to service', async () => {
    service.updateVendor.mockResolvedValue(undefined);

    const result = await controller.updateVendor(
      'prod-uuid-1',
      'vendor-uuid-1',
      createVendorDto,
    );

    expect(service.updateVendor).toHaveBeenCalledWith(
      'prod-uuid-1',
      'vendor-uuid-1',
      createVendorDto,
    );
    expect(result).toBeUndefined();
  });

  it('removeVendor delegates to service and returns undefined', async () => {
    service.removeVendor.mockResolvedValue(undefined);

    const result = await controller.removeVendor('prod-uuid-1', 'vendor-uuid-1');

    expect(service.removeVendor).toHaveBeenCalledWith(
      'prod-uuid-1',
      'vendor-uuid-1',
    );
    expect(result).toBeUndefined();
  });

  it('getVendors propagates NotFoundException', async () => {
    service.getVendors.mockRejectedValue(new NotFoundException());

    await expect(controller.getVendors('bad-prod')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('addVendor propagates NotFoundException when product missing', async () => {
    service.addVendor.mockRejectedValue(new NotFoundException());

    await expect(
      controller.addVendor('bad-prod', createVendorDto),
    ).rejects.toThrow(NotFoundException);
  });
});
