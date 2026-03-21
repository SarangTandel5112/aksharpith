import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
  bulkUpsertGroupFieldValues: jest.fn(),
  getGroupFieldValues: jest.fn(),
  countGroupFieldValues: jest.fn(),
  deleteGroupFieldValues: jest.fn(),
  getFieldIdsByGroupId: jest.fn(),
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
      const result = await service.findAll({
        page: 1,
        limit: 10,
        order: 'ASC',
      });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('calculates totalPages', async () => {
      repo.findAll.mockResolvedValue([[mockProduct], 21]);
      const result = await service.findAll({
        page: 1,
        limit: 10,
        order: 'ASC',
      });
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
      repo.addMedia.mockResolvedValue({
        id: 'media-1',
        url: 'http://img.com/1.jpg',
      });
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
      await expect(service.deleteMedia('uuid-1', 'bad-media')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertPhysicalAttributes', () => {
    it('delegates to repo after validating product', async () => {
      const attrs = { id: 'pa-1', productId: 'uuid-1', weight: 1.5 };
      repo.findById.mockResolvedValue(mockProduct);
      repo.upsertPhysicalAttributes.mockResolvedValue(attrs);
      const result = await service.upsertPhysicalAttributes('uuid-1', {
        weight: 1.5,
      });
      expect(result).toEqual(attrs);
      expect(repo.upsertPhysicalAttributes).toHaveBeenCalledWith('uuid-1', {
        weight: 1.5,
      });
    });

    it('throws NotFoundException when product not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.upsertPhysicalAttributes('bad', { weight: 1.5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPhysicalAttributes', () => {
    it('returns attributes when found', async () => {
      const attrs = { id: 'pa-1', productId: 'uuid-1', weight: 1.5 };
      repo.findById.mockResolvedValue(mockProduct);
      repo.getPhysicalAttributes.mockResolvedValue(attrs);
      const result = await service.getPhysicalAttributes('uuid-1');
      expect(result).toEqual(attrs);
    });

    it('returns null when no physical attributes set', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.getPhysicalAttributes.mockResolvedValue(null);
      const result = await service.getPhysicalAttributes('uuid-1');
      expect(result).toBeNull();
    });

    it('throws NotFoundException when product not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getPhysicalAttributes('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulkUpsertGroupFieldValues', () => {
    it('validates product exists, then delegates', async () => {
      repo.findById.mockResolvedValue({ id: 'prod-1', groupId: 'g-1' });
      repo.getFieldIdsByGroupId.mockResolvedValue(['f-1']);
      repo.bulkUpsertGroupFieldValues.mockResolvedValue(undefined);
      await expect(
        service.bulkUpsertGroupFieldValues('prod-1', {
          values: [{ fieldId: 'f-1', valueText: 'Tolkien' }],
        }),
      ).resolves.toBeUndefined();
    });

    it('throws 400 if product has no group', async () => {
      repo.findById.mockResolvedValue({ id: 'prod-1', groupId: null });
      await expect(
        service.bulkUpsertGroupFieldValues('prod-1', { values: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 404 if product not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.bulkUpsertGroupFieldValues('bad', { values: [] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when fieldIds do not belong to the product group', async () => {
      const productWithGroup = {
        ...mockProduct,
        id: 'uuid-1',
        groupId: 'group-1',
      };
      repo.findById.mockResolvedValue(productWithGroup);
      repo.getFieldIdsByGroupId.mockResolvedValue([
        'field-valid-1',
        'field-valid-2',
      ]);

      await expect(
        service.bulkUpsertGroupFieldValues('uuid-1', {
          values: [
            { fieldId: 'field-valid-1', valueText: 'ok' },
            { fieldId: 'field-ALIEN', valueText: 'bad' },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.bulkUpsertGroupFieldValues).not.toHaveBeenCalled();
    });

    it('skips field validation and upserts when values array is empty', async () => {
      const productWithGroup = {
        ...mockProduct,
        id: 'uuid-1',
        groupId: 'group-1',
      };
      repo.findById.mockResolvedValue(productWithGroup);
      repo.bulkUpsertGroupFieldValues.mockResolvedValue(undefined);

      await service.bulkUpsertGroupFieldValues('uuid-1', { values: [] });

      expect(repo.getFieldIdsByGroupId).not.toHaveBeenCalled();
      expect(repo.bulkUpsertGroupFieldValues).toHaveBeenCalledWith(
        'uuid-1',
        [],
      );
    });

    it('upserts successfully when all fieldIds belong to the group', async () => {
      const productWithGroup = {
        ...mockProduct,
        id: 'uuid-1',
        groupId: 'group-1',
      };
      repo.findById.mockResolvedValue(productWithGroup);
      repo.getFieldIdsByGroupId.mockResolvedValue(['f-1', 'f-2']);
      repo.bulkUpsertGroupFieldValues.mockResolvedValue(undefined);

      await service.bulkUpsertGroupFieldValues('uuid-1', {
        values: [
          { fieldId: 'f-1', valueText: 'hello' },
          { fieldId: 'f-2', valueNumber: 42 },
        ],
      });

      expect(repo.bulkUpsertGroupFieldValues).toHaveBeenCalledWith('uuid-1', [
        { fieldId: 'f-1', valueText: 'hello' },
        { fieldId: 'f-2', valueNumber: 42 },
      ]);
    });
  });

  describe('getGroupFieldValuesBulk', () => {
    it('returns field values when product exists with group', async () => {
      repo.findById.mockResolvedValue({ id: 'prod-1', groupId: 'g-1' });
      repo.getGroupFieldValues.mockResolvedValue([
        { fieldId: 'f-1', valueText: 'Tolkien' },
      ]);
      const result = await service.getGroupFieldValuesBulk('prod-1');
      expect(result).toHaveLength(1);
    });

    it('throws 404 if product not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getGroupFieldValuesBulk('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update with groupId change', () => {
    it('allows group change when no field values exist', async () => {
      repo.findById.mockResolvedValue({ ...mockProduct, groupId: 'old-group' });
      repo.findBySku.mockResolvedValue(null);
      repo.countGroupFieldValues.mockResolvedValue(0);
      repo.update.mockResolvedValue({ ...mockProduct, groupId: 'new-group' });
      const result = await service.update('uuid-1', { groupId: 'new-group' });
      expect(result.groupId).toBe('new-group');
    });

    it('throws 409 when group changes and values exist without clearFieldValues flag', async () => {
      repo.findById.mockResolvedValue({ ...mockProduct, groupId: 'old-group' });
      repo.findBySku.mockResolvedValue(null);
      repo.countGroupFieldValues.mockResolvedValue(5);
      await expect(
        service.update('uuid-1', { groupId: 'new-group' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deletes orphan values and changes group when clearFieldValues=true', async () => {
      repo.findById.mockResolvedValue({ ...mockProduct, groupId: 'old-group' });
      repo.findBySku.mockResolvedValue(null);
      repo.countGroupFieldValues.mockResolvedValue(5);
      repo.deleteGroupFieldValues.mockResolvedValue(undefined);
      repo.update.mockResolvedValue({ ...mockProduct, groupId: 'new-group' });
      const result = await service.update('uuid-1', {
        groupId: 'new-group',
        clearFieldValues: true,
      } as any);
      expect(repo.deleteGroupFieldValues).toHaveBeenCalledWith('uuid-1');
      expect(result.groupId).toBe('new-group');
    });

    it('skips group change guard when groupId is not being changed', async () => {
      repo.findById.mockResolvedValue({
        ...mockProduct,
        groupId: 'same-group',
      });
      repo.findBySku.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockProduct, name: 'Updated' });
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(repo.countGroupFieldValues).not.toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });
  });
});
