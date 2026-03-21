import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { CategoryRepository } from '../category.repository';

const mockCatRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockCat = {
  id: 'uuid-1', name: 'Clothing', isActive: true,
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
};

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: ReturnType<typeof mockCatRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useFactory: mockCatRepo },
      ],
    }).compile();
    service = module.get(CategoryService);
    repo = module.get(CategoryRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockCat], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('computes totalPages = ceil(total/limit)', async () => {
      repo.findAll.mockResolvedValue([[mockCat], 21]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(5);
    });
  });

  describe('findOne', () => {
    it('returns CategoryResponseDto', async () => {
      repo.findById.mockResolvedValue(mockCat);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates category', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockCat);
      const result = await service.create({ name: 'Clothing' });
      expect(result.name).toBe('Clothing');
    });

    it('throws ConflictException on duplicate', async () => {
      repo.findByName.mockResolvedValue(mockCat);
      await expect(service.create({ name: 'Clothing' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockCat);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockCat, name: 'Updated' });
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when name taken by other category', async () => {
      repo.findById.mockResolvedValue(mockCat);
      repo.findByName.mockResolvedValue({ ...mockCat, id: 'uuid-2' });
      await expect(service.update('uuid-1', { name: 'Conflict' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes', async () => {
      repo.findById.mockResolvedValue(mockCat);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
