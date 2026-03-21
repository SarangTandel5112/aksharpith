import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductVariantController } from '../product-variant.controller';
import { ProductVariantService } from '../product-variant.service';
import { JwtAuthGuard } from '../../../security/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

const mockService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  generateMatrix: jest.fn(),
});

describe('ProductVariantController', () => {
  let controller: ProductVariantController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVariantController],
      providers: [{ provide: ProductVariantService, useFactory: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(ProductVariantController);
    service = module.get(ProductVariantService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns variants list', async () => {
      service.findAll.mockResolvedValue({ items: [], total: 0 });
      const result = await controller.findAll('prod-1', { page: 1, limit: 20, order: 'ASC' });
      expect(result).toHaveProperty('items');
      expect(service.findAll).toHaveBeenCalledWith('prod-1', expect.any(Object));
    });
  });

  describe('findOne', () => {
    it('returns single variant', async () => {
      service.findOne.mockResolvedValue({ id: 'v-1' });
      const result = await controller.findOne('prod-1', 'v-1');
      expect(result).toHaveProperty('id', 'v-1');
    });

    it('propagates 404 from service', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('prod-1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateMatrix', () => {
    it('calls service.generateMatrix and returns variants', async () => {
      const variants = [{ id: 'v-1' }, { id: 'v-2' }];
      service.generateMatrix.mockResolvedValue(variants);
      const result = await controller.generateMatrix('prod-1', { attributeIds: ['attr-1'] });
      expect(result).toEqual(variants);
      expect(service.generateMatrix).toHaveBeenCalledWith('prod-1', { attributeIds: ['attr-1'] });
    });

    it('propagates NotFoundException from service', async () => {
      service.generateMatrix.mockRejectedValue(new NotFoundException('Product not found'));
      await expect(controller.generateMatrix('bad', { attributeIds: ['attr-1'] })).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a variant', async () => {
      const variant = { id: 'v-1', sku: 'SKU-001' };
      service.create.mockResolvedValue(variant);
      const result = await controller.create('prod-1', {
        sku: 'SKU-001',
        price: 10,
        attributeValueIds: ['val-1'],
      });
      expect(result).toEqual(variant);
    });
  });

  describe('update', () => {
    it('updates a variant', async () => {
      const updated = { id: 'v-1', price: 20 };
      service.update.mockResolvedValue(updated);
      const result = await controller.update('prod-1', 'v-1', { price: 20 });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('removes variant', async () => {
      service.remove.mockResolvedValue(undefined);
      await controller.remove('prod-1', 'v-1');
      expect(service.remove).toHaveBeenCalledWith('prod-1', 'v-1');
    });
  });
});
