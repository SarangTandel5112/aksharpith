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
});

describe('ProductRepository', () => {
  let productRepo: ProductRepository;
  let repo: ReturnType<typeof mockRepo>;
  let mediaRepo: ReturnType<typeof mockMediaRepo>;
  let marketingMediaRepo: ReturnType<typeof mockMarketingMediaRepo>;

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
    marketingMediaRepo = module.get(getRepositoryToken(ProductMarketingMedia));
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
});
