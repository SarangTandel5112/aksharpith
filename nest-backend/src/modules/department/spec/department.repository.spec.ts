import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { DepartmentRepository } from '../department.repository';
import { Department } from '../entities/department.entity';

const mockTypeOrmRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

describe('DepartmentRepository', () => {
  let deptRepo: DepartmentRepository;
  let repo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentRepository,
        { provide: getRepositoryToken(Department), useFactory: mockTypeOrmRepo },
      ],
    }).compile();
    deptRepo = module.get(DepartmentRepository);
    repo = module.get(getRepositoryToken(Department));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated departments', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await deptRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });

    it('calculates correct skip for page 3', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await deptRepo.findAll({ page: 3, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 5 }));
    });

    it('applies ILike search on name', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await deptRepo.findAll({ page: 1, limit: 10, search: 'elect', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ name: ILike('%elect%') }),
      }));
    });

    it('filters by isActive=true', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await deptRepo.findAll({ page: 1, limit: 10, isActive: true, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }));
    });

    it('sorts by name ASC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await deptRepo.findAll({ page: 1, limit: 10, sortBy: 'name', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        order: { name: 'ASC' },
      }));
    });

    it('sorts by createdAt DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await deptRepo.findAll({ page: 1, limit: 10, sortBy: 'createdAt', order: 'DESC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        order: { createdAt: 'DESC' },
      }));
    });
  });

  describe('findById', () => {
    it('returns department when found', async () => {
      const dept = { id: 'uuid-1', name: 'Electronics' };
      repo.findOne.mockResolvedValue(dept);
      expect(await deptRepo.findById('uuid-1')).toEqual(dept);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await deptRepo.findById('not-exist')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves department', async () => {
      const dto = { name: 'Electronics' };
      const dept = { id: 'uuid-1', ...dto };
      repo.create.mockReturnValue(dept);
      repo.save.mockResolvedValue(dept);
      expect(await deptRepo.create(dto)).toEqual(dept);
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await deptRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await deptRepo.softDelete('not-exist')).toBe(false);
    });
  });
});
