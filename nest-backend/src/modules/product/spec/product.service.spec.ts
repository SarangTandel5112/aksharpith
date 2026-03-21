import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductService } from '../product.service';
import { ProductRepository } from '../product.repository';

const mockProductRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  countByType: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  addMedia: jest.fn(),
  getMedia: jest.fn(),
  deleteMedia: jest.fn(),
  upsertPhysicalAttributes: jest.fn(),
  getPhysicalAttributes: jest.fn(),
});

const mockProduct = {
  id: 'uuid-1',
  name: 'Shoe',
  sku: 'SKU-001',
  productType: 'simple',
  basePrice: 99.99,
  stockQuantity: 10,
  isActive: true,
  itemInactive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductService', () => {
  let service: ProductService;
  let repo: ReturnType<typeof mockProductRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useFactory: mockProductRepo },
      ],
    }).compile();
    service = module.get(ProductService);
    repo = module.get(ProductRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockProduct], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('calculates totalPages', async () => {
      repo.findAll.mockResolvedValue([[mockProduct], 21]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns ProductResponseDto', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('returns count by type', async () => {
      repo.countByType.mockResolvedValue({ simple: 5, variable: 2 });
      const result = await service.getStats();
      expect(result).toHaveProperty('simple', 5);
    });
  });

  describe('create', () => {
    it('creates product when SKU unique', async () => {
      repo.findBySku.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockProduct);
      const result = await service.create({ name: 'Shoe', sku: 'SKU-001' });
      expect(result.sku).toBe('SKU-001');
    });

    it('throws ConflictException on duplicate SKU', async () => {
      repo.findBySku.mockResolvedValue(mockProduct);
      await expect(
        service.create({ name: 'Shoe', sku: 'SKU-001' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.findBySku.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockProduct, name: 'Updated Shoe' });
      const result = await service.update('uuid-1', { name: 'Updated Shoe' });
      expect(result.name).toBe('Updated Shoe');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when SKU taken by other product', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.findBySku.mockResolvedValue({ ...mockProduct, id: 'uuid-2' });
      await expect(
        service.update('uuid-1', { sku: 'SKU-DUP' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMedia', () => {
    it('adds media after validating product', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.addMedia.mockResolvedValue({ id: 'media-1', url: 'http://img.com/1.jpg' });
      const result = await service.addMedia('uuid-1', {
        url: 'http://img.com/1.jpg',
      });
      expect(result).toHaveProperty('id');
    });

    it('throws NotFoundException when product not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.addMedia('bad', { url: 'http://img.com/1.jpg' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMedia', () => {
    it('deletes media successfully', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.deleteMedia.mockResolvedValue(true);
      await expect(
        service.deleteMedia('uuid-1', 'media-1'),
      ).resolves.toBeUndefined();
    });

    it('throws NotFoundException when media not found', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.deleteMedia.mockResolvedValue(false);
      await expect(
        service.deleteMedia('uuid-1', 'bad-media'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
