import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { UserRepository } from '../user.repository';
import { User } from '../entities/user.entity';

const mockTypeOrmRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockUser: Partial<User> = {
  id: 'uuid-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  roleId: 'role-uuid-1',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

describe('UserRepository', () => {
  let userRepo: UserRepository;
  let repo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getRepositoryToken(User), useFactory: mockTypeOrmRepo },
      ],
    }).compile();
    userRepo = module.get(UserRepository);
    repo = module.get(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated users with correct skip/take', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('calculates correct skip for page 2', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('applies ILike search on firstName', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({ page: 1, limit: 10, search: 'john', order: 'ASC' });
      const call = repo.findAndCount.mock.calls[0][0];
      const whereArray = call.where as any[];
      expect(whereArray.some((w: any) => {
        return String(w.firstName) === String(ILike('%john%'));
      })).toBe(true);
    });

    it('applies ILike search on email', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({ page: 1, limit: 10, search: 'john', order: 'ASC' });
      const call = repo.findAndCount.mock.calls[0][0];
      const whereArray = call.where as any[];
      expect(whereArray.some((w: any) => {
        return String(w.email) === String(ILike('%john%'));
      })).toBe(true);
    });

    it('filters by roleId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({
        page: 1,
        limit: 10,
        roleId: 'role-uuid-1',
        order: 'ASC',
      });
      const call = repo.findAndCount.mock.calls[0][0];
      const whereArray = call.where as any[];
      expect(whereArray[0]).toMatchObject({ roleId: 'role-uuid-1' });
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      const call = repo.findAndCount.mock.calls[0][0];
      const whereArray = call.where as any[];
      expect(whereArray[0]).toMatchObject({ isActive: false });
    });

    it('sorts by firstName DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await userRepo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'firstName',
        order: 'DESC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { firstName: 'DESC' } }),
      );
    });

    it('returns users and count', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await userRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result).toEqual([[mockUser], 1]);
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      expect(await userRepo.findById('uuid-1')).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        relations: ['role'],
      });
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await userRepo.findById('not-exist')).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      expect(await userRepo.findByEmail('john@example.com')).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await userRepo.findByEmail('missing@example.com')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves a user', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashed',
        roleId: 'role-uuid-1',
      };
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);
      expect(await userRepo.create(dto as any)).toEqual(mockUser);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('updates and returns updated user', async () => {
      const updated = { ...mockUser, firstName: 'Jane' };
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOne.mockResolvedValue(updated);
      expect(await userRepo.update('uuid-1', { firstName: 'Jane' })).toEqual(
        updated,
      );
    });
  });

  describe('softDelete', () => {
    it('returns true when affected > 0', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await userRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when nothing deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await userRepo.softDelete('not-exist')).toBe(false);
    });
  });
});
