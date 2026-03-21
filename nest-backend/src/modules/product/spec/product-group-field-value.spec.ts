import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
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
import { UpsertGroupFieldValueDto } from '../dto/upsert-group-field-value.dto';

// ── Mock factories ──────────────────────────────────────────────────────────

const mockBaseRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockGroupFieldValueRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockProductServiceFactory = () => ({
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
  addVendor: jest.fn(),
  getVendors: jest.fn(),
  removeVendor: jest.fn(),
  upsertGroupFieldValue: jest.fn(),
  getGroupFieldValues: jest.fn(),
  removeGroupFieldValue: jest.fn(),
});

// ── Fixtures ────────────────────────────────────────────────────────────────

const PRODUCT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const FIELD_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const VALUE_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

const mockProduct = {
  id: PRODUCT_ID,
  name: 'Test Product',
  sku: 'SKU-TEST',
  productType: 'simple',
  basePrice: 10,
  stockQuantity: 5,
  isActive: true,
  itemInactive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFieldValue: Partial<ProductGroupFieldValue> = {
  id: VALUE_ID,
  productId: PRODUCT_ID,
  fieldId: FIELD_ID,
  valueText: 'Hello',
  valueNumber: null,
  valueBoolean: null,
  valueOptionId: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
};

// ── Repository Tests ─────────────────────────────────────────────────────────

describe('ProductRepository – group field values', () => {
  let productRepo: ProductRepository;
  let gfvRepo: ReturnType<typeof mockGroupFieldValueRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        { provide: getRepositoryToken(Product), useFactory: mockBaseRepo },
        { provide: getRepositoryToken(ProductMedia), useFactory: mockBaseRepo },
        {
          provide: getRepositoryToken(ProductPhysicalAttributes),
          useFactory: mockBaseRepo,
        },
        {
          provide: getRepositoryToken(ProductMarketingMedia),
          useFactory: mockBaseRepo,
        },
        { provide: getRepositoryToken(ProductZone), useFactory: mockBaseRepo },
        {
          provide: getRepositoryToken(ProductVendor),
          useFactory: mockBaseRepo,
        },
        {
          provide: getRepositoryToken(ProductGroupFieldValue),
          useFactory: mockGroupFieldValueRepo,
        },
        { provide: getRepositoryToken(GroupField), useFactory: mockBaseRepo },
        {
          provide: getRepositoryToken(GroupFieldOption),
          useFactory: mockBaseRepo,
        },
      ],
    }).compile();

    productRepo = module.get(ProductRepository);
    gfvRepo = module.get(getRepositoryToken(ProductGroupFieldValue));
  });

  afterEach(() => jest.clearAllMocks());

  describe('upsertGroupFieldValue', () => {
    const dto: UpsertGroupFieldValueDto = {
      fieldId: FIELD_ID,
      valueText: 'Hello',
    };

    it('creates a new record when none exists', async () => {
      gfvRepo.findOne.mockResolvedValue(null);
      gfvRepo.create.mockReturnValue({ ...mockFieldValue });
      gfvRepo.save.mockResolvedValue({ ...mockFieldValue });

      const result = await productRepo.upsertGroupFieldValue(PRODUCT_ID, dto);
      expect(gfvRepo.findOne).toHaveBeenCalledWith({
        where: { productId: PRODUCT_ID, fieldId: FIELD_ID },
      });
      expect(gfvRepo.create).toHaveBeenCalled();
      expect(gfvRepo.save).toHaveBeenCalled();
      expect(result.valueText).toBe('Hello');
    });

    it('updates an existing record', async () => {
      const existing = { ...mockFieldValue, valueText: 'Old' };
      gfvRepo.findOne.mockResolvedValue(existing);
      gfvRepo.save.mockResolvedValue({ ...existing, valueText: 'Hello' });

      const result = await productRepo.upsertGroupFieldValue(PRODUCT_ID, dto);
      expect(gfvRepo.create).not.toHaveBeenCalled();
      expect(gfvRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ valueText: 'Hello' }),
      );
      expect(result.valueText).toBe('Hello');
    });
  });

  describe('getGroupFieldValues', () => {
    it('returns field values with relations', async () => {
      const values = [{ ...mockFieldValue, field: {}, valueOption: null }];
      gfvRepo.find.mockResolvedValue(values);

      const result = await productRepo.getGroupFieldValues(PRODUCT_ID);
      expect(gfvRepo.find).toHaveBeenCalledWith({
        where: { productId: PRODUCT_ID },
        relations: ['field', 'valueOption'],
      });
      expect(result).toHaveLength(1);
    });

    it('returns empty array when none exist', async () => {
      gfvRepo.find.mockResolvedValue([]);
      const result = await productRepo.getGroupFieldValues(PRODUCT_ID);
      expect(result).toEqual([]);
    });
  });

  describe('removeGroupFieldValue', () => {
    it('returns true when a record is deleted', async () => {
      gfvRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await productRepo.removeGroupFieldValue(PRODUCT_ID, FIELD_ID);
      expect(gfvRepo.delete).toHaveBeenCalledWith({
        productId: PRODUCT_ID,
        fieldId: FIELD_ID,
      });
      expect(result).toBe(true);
    });

    it('returns false when no record matched', async () => {
      gfvRepo.delete.mockResolvedValue({ affected: 0 });
      const result = await productRepo.removeGroupFieldValue(PRODUCT_ID, FIELD_ID);
      expect(result).toBe(false);
    });
  });
});

// ── Service Tests ────────────────────────────────────────────────────────────

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
  addVendor: jest.fn(),
  getVendors: jest.fn(),
  removeVendor: jest.fn(),
  upsertGroupFieldValue: jest.fn(),
  getGroupFieldValues: jest.fn(),
  removeGroupFieldValue: jest.fn(),
});

describe('ProductService – group field values', () => {
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

  describe('upsertGroupFieldValue', () => {
    const dto: UpsertGroupFieldValueDto = { fieldId: FIELD_ID, valueText: 'Hi' };

    it('delegates to repository after verifying product exists', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.upsertGroupFieldValue.mockResolvedValue(mockFieldValue);

      const result = await service.upsertGroupFieldValue(PRODUCT_ID, dto);
      expect(repo.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(repo.upsertGroupFieldValue).toHaveBeenCalledWith(PRODUCT_ID, dto);
      expect(result).toEqual(mockFieldValue);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.upsertGroupFieldValue('non-existent', dto),
      ).rejects.toThrow(NotFoundException);
      expect(repo.upsertGroupFieldValue).not.toHaveBeenCalled();
    });
  });

  describe('getGroupFieldValues', () => {
    it('delegates to repository after verifying product exists', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.getGroupFieldValues.mockResolvedValue([mockFieldValue]);

      const result = await service.getGroupFieldValues(PRODUCT_ID);
      expect(repo.getGroupFieldValues).toHaveBeenCalledWith(PRODUCT_ID);
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getGroupFieldValues('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeGroupFieldValue', () => {
    it('delegates to repository successfully', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeGroupFieldValue.mockResolvedValue(true);

      await expect(
        service.removeGroupFieldValue(PRODUCT_ID, FIELD_ID),
      ).resolves.toBeUndefined();
      expect(repo.removeGroupFieldValue).toHaveBeenCalledWith(
        PRODUCT_ID,
        FIELD_ID,
      );
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.removeGroupFieldValue('bad-id', FIELD_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when field value does not exist', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.removeGroupFieldValue.mockResolvedValue(false);
      await expect(
        service.removeGroupFieldValue(PRODUCT_ID, FIELD_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

// ── Controller Tests ─────────────────────────────────────────────────────────

describe('ProductController – group field values', () => {
  let controller: ProductController;
  let service: ReturnType<typeof mockProductServiceFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useFactory: mockProductServiceFactory },
      ],
    }).compile();

    controller = module.get(ProductController);
    service = module.get(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  it('GET group-field-values delegates to service', async () => {
    service.getGroupFieldValues.mockResolvedValue([mockFieldValue]);
    const result = await controller.getGroupFieldValues(PRODUCT_ID);
    expect(service.getGroupFieldValues).toHaveBeenCalledWith(PRODUCT_ID);
    expect(result).toHaveLength(1);
  });

  it('GET group-field-values propagates NotFoundException', async () => {
    service.getGroupFieldValues.mockRejectedValue(new NotFoundException());
    await expect(controller.getGroupFieldValues('bad-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('PUT group-field-values delegates to service', async () => {
    const dto: UpsertGroupFieldValueDto = { fieldId: FIELD_ID, valueText: 'Hi' };
    service.upsertGroupFieldValue.mockResolvedValue(mockFieldValue);
    const result = await controller.upsertGroupFieldValue(PRODUCT_ID, dto);
    expect(service.upsertGroupFieldValue).toHaveBeenCalledWith(PRODUCT_ID, dto);
    expect(result).toEqual(mockFieldValue);
  });

  it('PUT group-field-values propagates NotFoundException', async () => {
    const dto: UpsertGroupFieldValueDto = { fieldId: FIELD_ID };
    service.upsertGroupFieldValue.mockRejectedValue(new NotFoundException());
    await expect(
      controller.upsertGroupFieldValue('bad-id', dto),
    ).rejects.toThrow(NotFoundException);
  });

  it('DELETE group-field-values delegates to service', async () => {
    service.removeGroupFieldValue.mockResolvedValue(undefined);
    const result = await controller.removeGroupFieldValue(PRODUCT_ID, FIELD_ID);
    expect(service.removeGroupFieldValue).toHaveBeenCalledWith(
      PRODUCT_ID,
      FIELD_ID,
    );
    expect(result).toBeUndefined();
  });

  it('DELETE group-field-values propagates NotFoundException', async () => {
    service.removeGroupFieldValue.mockRejectedValue(new NotFoundException());
    await expect(
      controller.removeGroupFieldValue(PRODUCT_ID, FIELD_ID),
    ).rejects.toThrow(NotFoundException);
  });
});
