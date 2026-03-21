import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DepartmentService } from '../department.service';
import { DepartmentRepository } from '../department.repository';

const mockDeptRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockDept = {
  id: 'uuid-1', name: 'Electronics', isActive: true,
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
};

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repo: ReturnType<typeof mockDeptRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        { provide: DepartmentRepository, useFactory: mockDeptRepo },
      ],
    }).compile();
    service = module.get(DepartmentService);
    repo = module.get(DepartmentRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockDept], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.totalPages).toBe(1);
    });

    it('returns empty result', async () => {
      repo.findAll.mockResolvedValue([[], 0]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.items).toHaveLength(0);
    });

    it('calculates totalPages correctly', async () => {
      repo.findAll.mockResolvedValue([[mockDept], 23]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns DepartmentResponseDto', async () => {
      repo.findById.mockResolvedValue(mockDept);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
      expect(result.name).toBe('Electronics');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates department when name unique', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockDept);
      const result = await service.create({ name: 'Electronics' });
      expect(result.name).toBe('Electronics');
    });

    it('throws ConflictException on duplicate name', async () => {
      repo.findByName.mockResolvedValue(mockDept);
      await expect(service.create({ name: 'Electronics' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockDept);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockDept, name: 'Updated' });
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when name taken by other dept', async () => {
      repo.findById.mockResolvedValue(mockDept);
      repo.findByName.mockResolvedValue({ ...mockDept, id: 'uuid-2' });
      await expect(service.update('uuid-1', { name: 'Conflict' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes department', async () => {
      repo.findById.mockResolvedValue(mockDept);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
