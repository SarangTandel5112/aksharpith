import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { RoleRepository } from '../role.repository';
import { Role } from '../entities/role.entity';

const mockTypeOrmRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

describe('RoleRepository', () => {
  let roleRepo: RoleRepository;
  let repo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        { provide: getRepositoryToken(Role), useFactory: mockTypeOrmRepo },
      ],
    }).compile();
    roleRepo = module.get(RoleRepository);
    repo = module.get(getRepositoryToken(Role));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated roles with correct skip/take', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('calculates correct skip for page 2', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('applies ILike search filter', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 1, limit: 10, search: 'adm', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ roleName: ILike('%adm%') }),
        }),
      );
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('sorts by roleName DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'roleName',
        order: 'DESC',
      });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { roleName: 'DESC' },
        }),
      );
    });

    it('returns roles and count', async () => {
      const roles = [{ id: 'uuid-1', roleName: 'Admin', isActive: true }];
      repo.findAndCount.mockResolvedValue([roles, 1]);
      const result = await roleRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result).toEqual([roles, 1]);
    });
  });

  describe('findById', () => {
    it('returns role when found', async () => {
      const role = { id: 'uuid-1', roleName: 'Admin' };
      repo.findOne.mockResolvedValue(role);
      expect(await roleRepo.findById('uuid-1')).toEqual(role);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await roleRepo.findById('not-exist')).toBeNull();
    });
  });

  describe('findByName', () => {
    it('finds role by name', async () => {
      const role = { id: 'uuid-1', roleName: 'Admin' };
      repo.findOne.mockResolvedValue(role);
      expect(await roleRepo.findByName('Admin')).toEqual(role);
    });
  });

  describe('create', () => {
    it('creates and saves a role', async () => {
      const dto = { roleName: 'Admin' };
      const role = { id: 'uuid-1', ...dto };
      repo.create.mockReturnValue(role);
      repo.save.mockResolvedValue(role);
      expect(await roleRepo.create(dto)).toEqual(role);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(role);
    });
  });

  describe('update', () => {
    it('updates and returns updated role', async () => {
      const updated = { id: 'uuid-1', roleName: 'Staff', isActive: true };
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOne.mockResolvedValue(updated);
      expect(await roleRepo.update('uuid-1', { roleName: 'Staff' })).toEqual(
        updated,
      );
    });
  });

  describe('softDelete', () => {
    it('returns true when affected > 0', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await roleRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when nothing deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await roleRepo.softDelete('not-exist')).toBe(false);
    });
  });
});
