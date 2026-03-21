import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RoleService } from '../role.service';
import { RoleRepository } from '../role.repository';

const mockRoleRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockRole = {
  id: 'uuid-1',
  roleName: 'Admin',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

describe('RoleService', () => {
  let service: RoleService;
  let repo: ReturnType<typeof mockRoleRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: RoleRepository, useFactory: mockRoleRepo },
      ],
    }).compile();
    service = module.get(RoleService);
    repo = module.get(RoleRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response with correct structure', async () => {
      repo.findAll.mockResolvedValue([[mockRole], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('returns empty items when no roles', async () => {
      repo.findAll.mockResolvedValue([[], 0]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('calculates totalPages = ceil(total / limit)', async () => {
      repo.findAll.mockResolvedValue([[mockRole], 15]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });

    it('maps entity to RoleResponseDto', async () => {
      repo.findAll.mockResolvedValue([[mockRole], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.items[0]).toHaveProperty('id', 'uuid-1');
      expect(result.items[0]).toHaveProperty('roleName', 'Admin');
    });
  });

  describe('findOne', () => {
    it('returns RoleResponseDto when found', async () => {
      repo.findById.mockResolvedValue(mockRole);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
      expect(result.roleName).toBe('Admin');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates role when name is unique', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockRole);
      const result = await service.create({ roleName: 'Admin' });
      expect(result.roleName).toBe('Admin');
      expect(repo.create).toHaveBeenCalledWith({ roleName: 'Admin' });
    });

    it('throws ConflictException when name already exists', async () => {
      repo.findByName.mockResolvedValue(mockRole);
      await expect(service.create({ roleName: 'Admin' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('updates role successfully', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockRole, roleName: 'Staff' });
      const result = await service.update('uuid-1', { roleName: 'Staff' });
      expect(result.roleName).toBe('Staff');
    });

    it('throws NotFoundException when role not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad-id', { roleName: 'Staff' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when new name taken by different role', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue({ ...mockRole, id: 'uuid-2' });
      await expect(
        service.update('uuid-1', { roleName: 'Viewer' }),
      ).rejects.toThrow(ConflictException);
    });

    it('allows updating to same name (no conflict)', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue(mockRole); // same id
      repo.update.mockResolvedValue(mockRole);
      await expect(
        service.update('uuid-1', { roleName: 'Admin' }),
      ).resolves.toBeDefined();
    });
  });

  describe('remove', () => {
    it('soft-deletes role successfully', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
      expect(repo.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
