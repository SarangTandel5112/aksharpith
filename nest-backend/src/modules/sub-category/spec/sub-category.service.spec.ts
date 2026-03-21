import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SubCategoryService } from '../sub-category.service';
import { SubCategoryRepository } from '../sub-category.repository';
import { CategoryService } from '../../category/category.service';

const mockSubCatRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByNameAndCategory: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockCategoryService = () => ({
  findOne: jest.fn(),
});

const mockSub = {
  id: 'uuid-1', name: 'T-Shirts', categoryId: 'cat-uuid',
  isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
};

const mockCategory = { id: 'cat-uuid', name: 'Clothing', isActive: true };

describe('SubCategoryService', () => {
  let service: SubCategoryService;
  let repo: ReturnType<typeof mockSubCatRepo>;
  let catService: ReturnType<typeof mockCategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubCategoryService,
        { provide: SubCategoryRepository, useFactory: mockSubCatRepo },
        { provide: CategoryService, useFactory: mockCategoryService },
      ],
    }).compile();
    service = module.get(SubCategoryService);
    repo = module.get(SubCategoryRepository);
    catService = module.get(CategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockSub], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('computes totalPages correctly', async () => {
      repo.findAll.mockResolvedValue([[mockSub], 11]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns SubCategoryResponseDto', async () => {
      repo.findById.mockResolvedValue(mockSub);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates when category exists and name+category unique', async () => {
      catService.findOne.mockResolvedValue(mockCategory);
      repo.findByNameAndCategory.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockSub);
      const result = await service.create({ name: 'T-Shirts', categoryId: 'cat-uuid' });
      expect(result.name).toBe('T-Shirts');
    });

    it('throws NotFoundException when category not found', async () => {
      catService.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.create({ name: 'T-Shirts', categoryId: 'bad-cat' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when (name, categoryId) duplicate', async () => {
      catService.findOne.mockResolvedValue(mockCategory);
      repo.findByNameAndCategory.mockResolvedValue(mockSub);
      await expect(service.create({ name: 'T-Shirts', categoryId: 'cat-uuid' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockSub);
      catService.findOne.mockResolvedValue(mockCategory);
      repo.findByNameAndCategory.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockSub, name: 'Polo Shirts' });
      const result = await service.update('uuid-1', { name: 'Polo Shirts' });
      expect(result.name).toBe('Polo Shirts');
    });

    it('throws NotFoundException when sub-category not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when new categoryId not found', async () => {
      repo.findById.mockResolvedValue(mockSub);
      catService.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.update('uuid-1', { categoryId: 'bad-cat' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when new (name, categoryId) duplicate', async () => {
      repo.findById.mockResolvedValue(mockSub);
      catService.findOne.mockResolvedValue(mockCategory);
      repo.findByNameAndCategory.mockResolvedValue({ ...mockSub, id: 'uuid-2' });
      await expect(service.update('uuid-1', { name: 'T-Shirts' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes sub-category', async () => {
      repo.findById.mockResolvedValue(mockSub);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
