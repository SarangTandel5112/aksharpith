import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { SubCategoryRepository } from '../sub-category.repository';
import { SubCategory } from '../entities/sub-category.entity';

const mockTypeOrmRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

describe('SubCategoryRepository', () => {
  let subCatRepo: SubCategoryRepository;
  let repo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubCategoryRepository,
        { provide: getRepositoryToken(SubCategory), useFactory: mockTypeOrmRepo },
      ],
    }).compile();
    subCatRepo = module.get(SubCategoryRepository);
    repo = module.get(getRepositoryToken(SubCategory));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates page 1 correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await subCatRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });

    it('paginates page 2 limit 5 correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await subCatRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 5 }));
    });

    it('applies ILike search on name', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await subCatRepo.findAll({ page: 1, limit: 10, search: 'shirt', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ name: ILike('%shirt%') }),
      }));
    });

    it('filters by categoryId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await subCatRepo.findAll({ page: 1, limit: 10, categoryId: 'cat-uuid', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ categoryId: 'cat-uuid' }),
      }));
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await subCatRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      }));
    });

    it('sorts by name DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await subCatRepo.findAll({ page: 1, limit: 10, sortBy: 'name', order: 'DESC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        order: { name: 'DESC' },
      }));
    });
  });

  describe('findById', () => {
    it('returns sub-category when found', async () => {
      const sub = { id: 'uuid-1', name: 'T-Shirts', categoryId: 'cat-uuid' };
      repo.findOne.mockResolvedValue(sub);
      expect(await subCatRepo.findById('uuid-1')).toEqual(sub);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await subCatRepo.findById('not-exist')).toBeNull();
    });
  });

  describe('findByNameAndCategory', () => {
    it('finds by name and categoryId', async () => {
      const sub = { id: 'uuid-1', name: 'T-Shirts', categoryId: 'cat-uuid' };
      repo.findOne.mockResolvedValue(sub);
      expect(await subCatRepo.findByNameAndCategory('T-Shirts', 'cat-uuid')).toEqual(sub);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { name: 'T-Shirts', categoryId: 'cat-uuid' } });
    });
  });

  describe('create', () => {
    it('creates and saves sub-category', async () => {
      const dto = { name: 'T-Shirts', categoryId: 'cat-uuid' };
      const sub = { id: 'uuid-1', ...dto };
      repo.create.mockReturnValue(sub);
      repo.save.mockResolvedValue(sub);
      expect(await subCatRepo.create(dto)).toEqual(sub);
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await subCatRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await subCatRepo.softDelete('not-exist')).toBe(false);
    });
  });
});
