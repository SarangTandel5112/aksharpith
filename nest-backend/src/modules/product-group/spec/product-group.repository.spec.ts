import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { ProductGroupRepository } from '../product-group.repository';
import { ProductGroup } from '../entities/product-group.entity';

const mockRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

describe('ProductGroupRepository', () => {
  let groupRepo: ProductGroupRepository;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductGroupRepository,
        { provide: getRepositoryToken(ProductGroup), useFactory: mockRepo },
      ],
    }).compile();
    groupRepo = module.get(ProductGroupRepository);
    repo = module.get(getRepositoryToken(ProductGroup));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates page 1 correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('paginates page 2 limit 5 correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('applies ILike search on name', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, search: 'shoe', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: ILike('%shoe%') }),
        }),
      );
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('sorts by name DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, sortBy: 'name', order: 'DESC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { name: 'DESC' } }),
      );
    });
  });

  describe('findById', () => {
    it('returns group when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Apparel' });
      expect(await groupRepo.findById('uuid-1')).toHaveProperty('name', 'Apparel');
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await groupRepo.findById('bad')).toBeNull();
    });
  });

  describe('findWithFields', () => {
    it('loads relations fields and options', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', fields: [] });
      await groupRepo.findWithFields('uuid-1');
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['fields', 'fields.options'] }),
      );
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await groupRepo.findWithFields('bad')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves group', async () => {
      const dto = { name: 'Apparel', fields: [] };
      const group = { id: 'uuid-1', name: 'Apparel' };
      repo.create.mockReturnValue(group);
      repo.save.mockResolvedValue(group);
      expect(await groupRepo.create(dto)).toEqual(group);
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await groupRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await groupRepo.softDelete('bad')).toBe(false);
    });
  });
});
