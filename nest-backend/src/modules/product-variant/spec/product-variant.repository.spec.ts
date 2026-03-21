import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductVariantRepository } from '../product-variant.repository';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantMedia } from '../entities/product-variant-media.entity';

const mockRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  delete: jest.fn(),
});
const mockMediaRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ProductVariantRepository', () => {
  let variantRepo: ProductVariantRepository;
  let repo: ReturnType<typeof mockRepo>;
  let mediaRepo: ReturnType<typeof mockMediaRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantRepository,
        { provide: getRepositoryToken(ProductVariant), useFactory: mockRepo },
        { provide: getRepositoryToken(ProductVariantMedia), useFactory: mockMediaRepo },
      ],
    }).compile();
    variantRepo = module.get(ProductVariantRepository);
    repo = module.get(getRepositoryToken(ProductVariant));
    mediaRepo = module.get(getRepositoryToken(ProductVariantMedia));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates page 1', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await variantRepo.findAll({ page: 1, limit: 10, order: 'ASC', productId: 'prod-1' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, where: { productId: 'prod-1' } }),
      );
    });

    it('paginates page 2', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await variantRepo.findAll({ page: 2, limit: 5, order: 'ASC', productId: 'prod-1' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await variantRepo.findAll({ page: 1, limit: 10, order: 'ASC', productId: 'prod-1', isActive: false });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isActive: false }) }),
      );
    });

    it('filters by isDeleted=true', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await variantRepo.findAll({ page: 1, limit: 10, order: 'ASC', productId: 'prod-1', isDeleted: true });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isDeleted: true }) }),
      );
    });

    it('returns paginated result shape', async () => {
      repo.findAndCount.mockResolvedValue([[{ id: 'v-1' }], 1]);
      const result = await variantRepo.findAll({ page: 1, limit: 10, order: 'ASC', productId: 'prod-1' });
      expect(result).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });
  });

  describe('findById', () => {
    it('loads variantAttributes relation', async () => {
      repo.findOne.mockResolvedValue({ id: 'v-1' });
      await variantRepo.findById('v-1');
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ relations: expect.arrayContaining(['variantAttributes']) }),
      );
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await variantRepo.findById('bad')).toBeNull();
    });
  });

  describe('findByCombinationHash', () => {
    it('returns variant when hash matches', async () => {
      const variant = { id: 'v-1', combinationHash: 'a_b' };
      repo.findOne.mockResolvedValue(variant);
      const result = await variantRepo.findByCombinationHash('prod-1', 'a_b');
      expect(result).toEqual(variant);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await variantRepo.findByCombinationHash('prod-1', 'no-match')).toBeNull();
    });

    it('searches with withDeleted: true', async () => {
      repo.findOne.mockResolvedValue(null);
      await variantRepo.findByCombinationHash('prod-1', 'hash');
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await variantRepo.softDelete('v-1')).toBe(true);
    });

    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await variantRepo.softDelete('bad')).toBe(false);
    });
  });

  describe('createWithAttributes', () => {
    it('creates variant with sorted hash', async () => {
      const attributeMap = { 'val-b': 'attr-1', 'val-a': 'attr-2' };
      const dto = { sku: 'SKU-001', price: 9.99, stockQuantity: 0, attributeValueIds: ['val-b', 'val-a'] };
      const saved = { id: 'v-new', combinationHash: 'val-a_val-b' };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);
      const result = await variantRepo.createWithAttributes('prod-1', dto, attributeMap);
      expect(result).toEqual(saved);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ combinationHash: 'val-a_val-b' }),
      );
    });
  });

  describe('addMedia', () => {
    it('creates and saves media', async () => {
      const dto = { url: 'http://img.com/1.jpg' };
      const media = { id: 'media-1', variantId: 'v-1', ...dto };
      mediaRepo.create.mockReturnValue(media);
      mediaRepo.save.mockResolvedValue(media);
      expect(await variantRepo.addMedia('v-1', dto)).toEqual(media);
    });
  });
});
