import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductGroupService } from '../product-group.service';
import { ProductGroupRepository } from '../product-group.repository';

const mockGroupRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findWithFields: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockGroup = {
  id: 'uuid-1',
  name: 'Apparel',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('ProductGroupService', () => {
  let service: ProductGroupService;
  let repo: ReturnType<typeof mockGroupRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductGroupService,
        { provide: ProductGroupRepository, useFactory: mockGroupRepo },
      ],
    }).compile();
    service = module.get(ProductGroupService);
    repo = module.get(ProductGroupRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockGroup], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('calculates totalPages correctly', async () => {
      repo.findAll.mockResolvedValue([[mockGroup], 11]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns dto when found', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWithFields', () => {
    it('returns dto with fields when found', async () => {
      repo.findWithFields.mockResolvedValue({ ...mockGroup, fields: [] });
      const result = await service.findWithFields('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findWithFields.mockResolvedValue(null);
      await expect(service.findWithFields('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates group when name unique', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockGroup);
      const result = await service.create({ name: 'Apparel' });
      expect(result.name).toBe('Apparel');
    });

    it('throws ConflictException on duplicate name', async () => {
      repo.findByName.mockResolvedValue(mockGroup);
      await expect(service.create({ name: 'Apparel' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockGroup, name: 'Updated' });
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when name taken by other group', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      repo.findByName.mockResolvedValue({ ...mockGroup, id: 'uuid-2' });
      await expect(service.update('uuid-1', { name: 'Conflict' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
