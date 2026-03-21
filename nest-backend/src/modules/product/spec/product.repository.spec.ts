import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { ProductRepository } from '../product.repository';
import { Product, ProductType } from '../entities/product.entity';
import { ProductMedia } from '../entities/product-media.entity';
import { ProductPhysicalAttributes } from '../entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from '../entities/product-marketing-media.entity';
import { ProductZone } from '../entities/product-zone.entity';
import { ProductVendor } from '../entities/product-vendor.entity';
import { ProductGroupFieldValue } from '../entities/product-group-field-value.entity';

const mockRepo = () => ({
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
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
  upsert: jest.fn(),
});

describe('ProductRepository', () => {
  let productRepo: ProductRepository;
  let repo: ReturnType<typeof mockRepo>;
  let mediaRepo: ReturnType<typeof mockMediaRepo>;
  let physRepo: ReturnType<typeof mockPhysRepo>;
  let marketingMediaRepo: ReturnType<typeof mockMarketingMediaRepo>;
  let groupFieldValueRepo: ReturnType<typeof mockGroupFieldValueRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        { provide: getRepositoryToken(Product), useFactory: mockRepo },
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
        { provide: getRepositoryToken(ProductZone), useFactory: mockZoneRepo },
        {
          provide: getRepositoryToken(ProductVendor),
          useFactory: mockVendorRepo,
        },
        {
          provide: getRepositoryToken(ProductGroupFieldValue),
          useFactory: mockGroupFieldValueRepo,
        },
      ],
    }).compile();
    productRepo = module.get(ProductRepository);
    repo = module.get(getRepositoryToken(Product));
    mediaRepo = module.get(getRepositoryToken(ProductMedia));
    physRepo = module.get(getRepositoryToken(ProductPhysicalAttributes));
    marketingMediaRepo = module.get(getRepositoryToken(ProductMarketingMedia));
    groupFieldValueRepo = module.get(
      getRepositoryToken(ProductGroupFieldValue),
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates page 1', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('paginates page 2 limit 5', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('applies ILike search on name', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        search: 'shoe',
        order: 'ASC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: ILike('%shoe%') }),
        }),
      );
    });

    it('filters by departmentId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        departmentId: 'dept-uuid',
        order: 'ASC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departmentId: 'dept-uuid' }),
        }),
      );
    });

    it('filters by subCategoryId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        subCategoryId: 'sub-uuid',
        order: 'ASC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ subCategoryId: 'sub-uuid' }),
        }),
      );
    });

    it('filters by productType', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        productType: ProductType.VARIABLE,
        order: 'ASC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productType: ProductType.VARIABLE }),
        }),
      );
    });

    it('filters by isActive', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        isActive: false,
        order: 'ASC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('filters by itemInactive', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        itemInactive: true,
        order: 'ASC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ itemInactive: true }),
        }),
      );
    });

    it('applies Between for minPrice and maxPrice', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        minPrice: 10,
        maxPrice: 100,
        order: 'ASC',
      });
      const call = repo.findAndCount.mock.calls[0][0];
      expect(call.where).toHaveProperty('basePrice');
    });

    it('applies MoreThanOrEqual for minPrice only', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        minPrice: 50,
        order: 'ASC',
      });
      const call = repo.findAndCount.mock.calls[0][0];
      expect(call.where).toHaveProperty('basePrice');
    });

    it('applies minStock filter', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        minStock: 5,
        order: 'ASC',
      });
      const call = repo.findAndCount.mock.calls[0][0];
      expect(call.where).toHaveProperty('stockQuantity');
    });

    it('sorts by name DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await productRepo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        order: 'DESC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { name: 'DESC' } }),
      );
    });
  });

  describe('findById', () => {
    it('returns product when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Shoe' });
      expect(await productRepo.findById('uuid-1')).toHaveProperty(
        'name',
        'Shoe',
      );
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await productRepo.findById('bad')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves product', async () => {
      const dto = { name: 'Shoe', sku: 'SKU-001' };
      const product = { id: 'uuid-1', ...dto };
      repo.create.mockReturnValue(product);
      repo.save.mockResolvedValue(product);
      expect(await productRepo.create(dto as any)).toEqual(product);
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await productRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await productRepo.softDelete('bad')).toBe(false);
    });
  });

  describe('addMedia', () => {
    it('creates and saves media', async () => {
      const dto = { url: 'http://img.com/1.jpg' };
      const media = { id: 'media-1', productId: 'uuid-1', ...dto };
      mediaRepo.create.mockReturnValue(media);
      mediaRepo.save.mockResolvedValue(media);
      expect(await productRepo.addMedia('uuid-1', dto as any)).toEqual(media);
    });
  });

  describe('upsertPhysicalAttributes', () => {
    it('creates new record when none exists', async () => {
      const dto = { weight: 1.5, length: 10, width: 5, height: 3 };
      const saved = { id: 'pa-1', productId: 'uuid-1', ...dto };
      physRepo.findOne.mockResolvedValue(null);
      physRepo.create.mockReturnValue(saved);
      physRepo.save.mockResolvedValue(saved);
      const result = await productRepo.upsertPhysicalAttributes(
        'uuid-1',
        dto as any,
      );
      expect(result).toEqual(saved);
      expect(physRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 'uuid-1', ...dto }),
      );
    });

    it('updates existing record', async () => {
      const existing = {
        id: 'pa-1',
        productId: 'uuid-1',
        weight: 1.0,
        length: 8,
        width: 4,
        height: 2,
      };
      const dto = { weight: 2.0 };
      const updated = { ...existing, weight: 2.0 };
      physRepo.findOne.mockResolvedValue(existing);
      physRepo.save.mockResolvedValue(updated);
      const result = await productRepo.upsertPhysicalAttributes(
        'uuid-1',
        dto as any,
      );
      expect(result.weight).toBe(2.0);
      expect(physRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('getPhysicalAttributes', () => {
    it('returns record when found', async () => {
      const attrs = { id: 'pa-1', productId: 'uuid-1', weight: 1.5 };
      physRepo.findOne.mockResolvedValue(attrs);
      expect(await productRepo.getPhysicalAttributes('uuid-1')).toEqual(attrs);
    });

    it('returns null when not found', async () => {
      physRepo.findOne.mockResolvedValue(null);
      expect(await productRepo.getPhysicalAttributes('uuid-1')).toBeNull();
    });
  });

  describe('bulkUpsertGroupFieldValues', () => {
    it('upserts all values via ON CONFLICT', async () => {
      groupFieldValueRepo.upsert.mockResolvedValue({ identifiers: [] });
      await productRepo.bulkUpsertGroupFieldValues('prod-1', [
        { fieldId: 'f-1', valueText: 'Tolkien' },
        { fieldId: 'f-2', valueNumber: 450 },
      ]);
      expect(groupFieldValueRepo.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            productId: 'prod-1',
            fieldId: 'f-1',
            valueText: 'Tolkien',
          }),
        ]),
        { conflictPaths: ['productId', 'fieldId'] },
      );
    });

    it('is a no-op for empty values array', async () => {
      await productRepo.bulkUpsertGroupFieldValues('prod-1', []);
      expect(groupFieldValueRepo.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getGroupFieldValues', () => {
    it('returns field values with field + options loaded', async () => {
      groupFieldValueRepo.find.mockResolvedValue([
        {
          fieldId: 'f-1',
          valueText: 'Tolkien',
          field: { fieldName: 'Author', fieldKey: 'author' },
        },
      ]);
      const result = await productRepo.getGroupFieldValues('prod-1');
      expect(result[0]).toHaveProperty('field');
      expect(groupFieldValueRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 'prod-1' },
          relations: expect.arrayContaining(['field', 'field.options']),
        }),
      );
    });
  });

  describe('applyGroupFieldFilters', () => {
    let qb: any;

    beforeEach(() => {
      qb = {
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
      };
    });

    it('adds no subquery for empty gf object', () => {
      productRepo.applyGroupFieldFilters(qb, {});
      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('adds EXISTS subquery for equality filter', () => {
      productRepo.applyGroupFieldFilters(qb, { language: 'hi' });
      expect(qb.andWhere).toHaveBeenCalledTimes(1);
      const [clause] = qb.andWhere.mock.calls[0];
      expect(clause).toContain('EXISTS');
      expect(clause).toContain('field_key');
    });

    it('adds EXISTS subquery for $btw range filter', () => {
      productRepo.applyGroupFieldFilters(qb, { pages: '$btw:100,500' });
      expect(qb.andWhere).toHaveBeenCalledTimes(1);
      const [clause] = qb.andWhere.mock.calls[0];
      expect(clause).toContain('BETWEEN');
    });

    it('adds EXISTS subquery for $ilike text filter', () => {
      productRepo.applyGroupFieldFilters(qb, { author: '$ilike:tolkien' });
      const [clause] = qb.andWhere.mock.calls[0];
      expect(clause).toContain('ILIKE');
    });

    it('adds EXISTS subquery for $gte filter', () => {
      productRepo.applyGroupFieldFilters(qb, { pages: '$gte:100' });
      const [clause] = qb.andWhere.mock.calls[0];
      expect(clause).toContain('>=');
    });

    it('adds EXISTS subquery for $lte filter', () => {
      productRepo.applyGroupFieldFilters(qb, { pages: '$lte:500' });
      const [clause] = qb.andWhere.mock.calls[0];
      expect(clause).toContain('<=');
    });

    it('adds multiple AND-joined EXISTS for multiple keys', () => {
      productRepo.applyGroupFieldFilters(qb, {
        language: 'hi',
        pages: '$btw:100,500',
      });
      expect(qb.andWhere).toHaveBeenCalledTimes(2);
    });
  });
});
