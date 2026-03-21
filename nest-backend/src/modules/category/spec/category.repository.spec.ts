import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

const mockTypeOrmRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

describe('CategoryRepository', () => {
  let catRepo: CategoryRepository;
  let repo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        { provide: getRepositoryToken(Category), useFactory: mockTypeOrmRepo },
      ],
    }).compile();
    catRepo = module.get(CategoryRepository);
    repo = module.get(getRepositoryToken(Category));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates correctly for page 1', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await catRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });

    it('paginates correctly for page 2 limit 5', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await catRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 5 }));
    });

    it('applies ILike search on name', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await catRepo.findAll({ page: 1, limit: 10, search: 'cloth', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ name: ILike('%cloth%') }),
      }));
    });

    it('filters by isActive', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await catRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      }));
    });

    it('does not apply isActive filter when undefined', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await catRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      const call = repo.findAndCount.mock.calls[0][0];
      expect(call.where).not.toHaveProperty('isActive');
    });

    it('sorts by name DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await catRepo.findAll({ page: 1, limit: 10, sortBy: 'name', order: 'DESC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        order: { name: 'DESC' },
      }));
    });
  });

  describe('findById', () => {
    it('returns category when found', async () => {
      const cat = { id: 'uuid-1', name: 'Clothing' };
      repo.findOne.mockResolvedValue(cat);
      expect(await catRepo.findById('uuid-1')).toEqual(cat);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await catRepo.findById('not-exist')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves category', async () => {
      const dto = { name: 'Clothing' };
      const cat = { id: 'uuid-1', ...dto };
      repo.create.mockReturnValue(cat);
      repo.save.mockResolvedValue(cat);
      expect(await catRepo.create(dto)).toEqual(cat);
    });
  });

  describe('softDelete', () => {
    it('returns true when affected > 0', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await catRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when nothing deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await catRepo.softDelete('not-exist')).toBe(false);
    });
  });
});
