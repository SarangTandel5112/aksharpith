import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductVariantService } from '../product-variant.service';
import { ProductVariantRepository } from '../product-variant.repository';
import { Product } from '../../product/entities/product.entity';
import { ProductAttributeValue } from '../../product-attribute/entities/product-attribute-value.entity';

const mockVariantRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByCombinationHash: jest.fn(),
  createWithAttributes: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
});
const mockProductRepo = () => ({ findOne: jest.fn() });
const mockValueRepo = () => ({
  find: jest.fn(),
});

describe('ProductVariantService', () => {
  let service: ProductVariantService;
  let variantRepo: ReturnType<typeof mockVariantRepo>;
  let productRepo: ReturnType<typeof mockProductRepo>;
  let valueRepo: ReturnType<typeof mockValueRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        { provide: ProductVariantRepository, useFactory: mockVariantRepo },
        { provide: getRepositoryToken(Product), useFactory: mockProductRepo },
        {
          provide: getRepositoryToken(ProductAttributeValue),
          useFactory: mockValueRepo,
        },
      ],
    }).compile();
    service = module.get(ProductVariantService);
    variantRepo = module.get(ProductVariantRepository);
    productRepo = module.get(getRepositoryToken(Product));
    valueRepo = module.get(getRepositoryToken(ProductAttributeValue));
  });

  afterEach(() => jest.clearAllMocks());

  const mockProduct = { id: 'prod-1', name: 'Test Product' };

  describe('findAll', () => {
    it('returns paginated variants', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      const result = await service.findAll('prod-1', {
        page: 1,
        limit: 20,
        order: 'ASC',
      });
      expect(result.items).toEqual([]);
    });

    it('throws 404 if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(
        service.findAll('bad', { page: 1, limit: 20, order: 'ASC' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns variant when found', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById.mockResolvedValue({
        id: 'v-1',
        productId: 'prod-1',
      });
      const result = await service.findOne('prod-1', 'v-1');
      expect(result).toHaveProperty('id', 'v-1');
    });

    it('throws 404 if variant belongs to different product', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById.mockResolvedValue({
        id: 'v-1',
        productId: 'other-prod',
      });
      await expect(service.findOne('prod-1', 'v-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates variant successfully', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findByCombinationHash.mockResolvedValue(null);
      valueRepo.find.mockResolvedValue([
        { id: 'val-a', attributeId: 'attr-1' },
        { id: 'val-b', attributeId: 'attr-2' },
      ]);
      const created = { id: 'v-1', sku: 'SKU-001' };
      variantRepo.createWithAttributes.mockResolvedValue(created);
      const result = await service.create('prod-1', {
        sku: 'SKU-001',
        price: 9.99,
        attributeValueIds: ['val-a', 'val-b'],
      });
      expect(result).toEqual(created);
    });

    it('throws 400 when one or more attribute values are invalid', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findByCombinationHash.mockResolvedValue(null);
      valueRepo.find.mockResolvedValue([{ id: 'val-a', attributeId: 'attr-1' }]);

      await expect(
        service.create('prod-1', {
          sku: 'SKU-001',
          price: 9.99,
          attributeValueIds: ['val-a', 'missing'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 409 on duplicate active combination', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findByCombinationHash.mockResolvedValue({
        id: 'v-existing',
        isDeleted: false,
        deletedAt: null,
      });
      await expect(
        service.create('prod-1', {
          sku: 'SKU-002',
          price: 10,
          attributeValueIds: ['val-a'],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws 404 if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create('bad', {
          sku: 'SKU',
          price: 1,
          attributeValueIds: ['val'],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates variant fields and returns updated variant', async () => {
      const updated = {
        id: 'v-1',
        productId: 'prod-1',
        price: 19.99,
        stockQuantity: 50,
      };
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById
        .mockResolvedValueOnce({ id: 'v-1', productId: 'prod-1' }) // findOne check
        .mockResolvedValueOnce(updated); // post-update fetch
      variantRepo.update.mockResolvedValue(undefined);

      const result = await service.update('prod-1', 'v-1', {
        price: 19.99,
        stockQuantity: 50,
      });

      expect(variantRepo.update).toHaveBeenCalledWith('v-1', {
        price: 19.99,
        stockQuantity: 50,
      });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when product does not exist', async () => {
      productRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('bad-prod', 'v-1', { price: 9.99 }),
      ).rejects.toThrow(NotFoundException);
      expect(variantRepo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when variant does not belong to the product', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById.mockResolvedValue({
        id: 'v-1',
        productId: 'other-prod',
      });

      await expect(
        service.update('prod-1', 'v-1', { price: 9.99 }),
      ).rejects.toThrow(NotFoundException);
      expect(variantRepo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when variant does not exist (findById returns null)', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById.mockResolvedValue(null);

      await expect(
        service.update('prod-1', 'bad-variant', { price: 9.99 }),
      ).rejects.toThrow(NotFoundException);
      expect(variantRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('generateMatrix', () => {
    it('creates all combinations: 2 attributes × 3+2 values = 6 variants', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      valueRepo.find.mockImplementation(
        (opts: { where: { attributeId: string } }) => {
          if (opts.where.attributeId === 'attr-1') {
            return Promise.resolve([
              { id: 'a1v1', attributeId: 'attr-1' },
              { id: 'a1v2', attributeId: 'attr-1' },
              { id: 'a1v3', attributeId: 'attr-1' },
            ]);
          }
          return Promise.resolve([
            { id: 'a2v1', attributeId: 'attr-2' },
            { id: 'a2v2', attributeId: 'attr-2' },
          ]);
        },
      );
      variantRepo.findByCombinationHash.mockResolvedValue(null);
      variantRepo.createWithAttributes.mockImplementation(
        async (_pid: string, dto: { attributeValueIds: string[] }) => ({
          id: `v-${dto.attributeValueIds.join('-')}`,
          combinationHash: [...dto.attributeValueIds].sort().join('_'),
        }),
      );

      const result = await service.generateMatrix('prod-1', {
        attributeIds: ['attr-1', 'attr-2'],
      });
      expect(result).toHaveLength(6);
      expect(variantRepo.createWithAttributes).toHaveBeenCalledTimes(6);
    });

    it('skips existing non-deleted combinations', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      valueRepo.find.mockResolvedValue([
        { id: 'val-1', attributeId: 'attr-1' },
      ]);
      variantRepo.findByCombinationHash.mockResolvedValue({
        id: 'v-existing',
        isDeleted: false,
        deletedAt: null,
      });

      const result = await service.generateMatrix('prod-1', {
        attributeIds: ['attr-1'],
      });
      expect(result).toHaveLength(1);
      expect(variantRepo.createWithAttributes).not.toHaveBeenCalled();
    });

    it('restores soft-deleted combinations', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      valueRepo.find.mockResolvedValue([
        { id: 'val-1', attributeId: 'attr-1' },
      ]);
      const deletedVariant = {
        id: 'v-deleted',
        isDeleted: true,
        deletedAt: new Date(),
      };
      variantRepo.findByCombinationHash.mockResolvedValue(deletedVariant);
      variantRepo.restore.mockResolvedValue(undefined);
      variantRepo.findById.mockResolvedValue({
        ...deletedVariant,
        isDeleted: false,
        deletedAt: null,
      });

      const result = await service.generateMatrix('prod-1', {
        attributeIds: ['attr-1'],
      });
      expect(variantRepo.restore).toHaveBeenCalledWith('v-deleted');
      expect(result).toHaveLength(1);
    });

    it('throws 404 if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(
        service.generateMatrix('bad', { attributeIds: ['attr-1'] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 404 if attribute has no values', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      valueRepo.find.mockResolvedValue([]);
      await expect(
        service.generateMatrix('prod-1', { attributeIds: ['attr-empty'] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates 8 variants: 3 attributes × 2 values each', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      let callCount = 0;
      valueRepo.find.mockImplementation(async () => {
        const idx = ++callCount;
        return [
          { id: `attr${idx}-v1`, attributeId: `attr-${idx}` },
          { id: `attr${idx}-v2`, attributeId: `attr-${idx}` },
        ];
      });
      variantRepo.findByCombinationHash.mockResolvedValue(null);
      variantRepo.createWithAttributes.mockImplementation(
        async (_pid: string, dto: { attributeValueIds: string[] }) => ({
          id: `v-${dto.attributeValueIds.join('-')}`,
        }),
      );

      const result = await service.generateMatrix('prod-1', {
        attributeIds: ['attr-1', 'attr-2', 'attr-3'],
      });
      expect(result).toHaveLength(8);
    });
  });

  describe('remove', () => {
    it('soft-deletes variant', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById.mockResolvedValue({
        id: 'v-1',
        productId: 'prod-1',
      });
      variantRepo.softDelete.mockResolvedValue(true);
      await service.remove('prod-1', 'v-1');
      expect(variantRepo.softDelete).toHaveBeenCalledWith('v-1');
    });

    it('throws 404 if variant not found', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      variantRepo.findById.mockResolvedValue(null);
      await expect(service.remove('prod-1', 'bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
