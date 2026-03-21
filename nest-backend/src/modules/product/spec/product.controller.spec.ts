import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';

const mockService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  getStats: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addMedia: jest.fn(),
  getMedia: jest.fn(),
  deleteMedia: jest.fn(),
  upsertPhysicalAttributes: jest.fn(),
  getPhysicalAttributes: jest.fn(),
  bulkUpsertGroupFieldValues: jest.fn(),
  getGroupFieldValuesBulk: jest.fn(),
  getGroupFieldValues: jest.fn(),
});

describe('ProductController', () => {
  let controller: ProductController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useFactory: mockService }],
    }).compile();
    controller = module.get(ProductController);
    service = module.get(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns paginated result', async () => {
    service.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    expect(
      await controller.findAll({ page: 1, limit: 10, order: 'ASC' }),
    ).toHaveProperty('items');
  });

  it('getStats returns counts', async () => {
    service.getStats.mockResolvedValue({ simple: 3 });
    expect(await controller.getStats()).toHaveProperty('simple');
  });

  it('findOne returns product', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Shoe' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });

  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('create returns product', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', sku: 'SKU-001' });
    expect(
      await controller.create({ name: 'Shoe', sku: 'SKU-001' }),
    ).toHaveProperty('id');
  });

  it('create propagates ConflictException on duplicate SKU', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(
      controller.create({ name: 'Shoe', sku: 'SKU-DUP' }),
    ).rejects.toThrow(ConflictException);
  });

  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });

  it('addMedia delegates to service', async () => {
    service.addMedia.mockResolvedValue({ id: 'media-1' });
    expect(
      await controller.addMedia('uuid-1', { url: 'http://img.com/1.jpg' }),
    ).toHaveProperty('id');
  });

  it('deleteMedia delegates to service', async () => {
    service.deleteMedia.mockResolvedValue(undefined);
    expect(await controller.deleteMedia('uuid-1', 'media-1')).toBeUndefined();
  });

  it('upsertPhysicalAttributes delegates to service', async () => {
    service.upsertPhysicalAttributes.mockResolvedValue({ id: 'pa-1' });
    expect(
      await controller.upsertPhysicalAttributes('uuid-1', { weight: 1.5 }),
    ).toHaveProperty('id');
  });

  describe('bulkUpsertGroupFieldValues', () => {
    it('delegates to service', async () => {
      service.bulkUpsertGroupFieldValues.mockResolvedValue(undefined);
      await expect(
        controller.bulkUpsertGroupFieldValues('prod-1', { values: [] }),
      ).resolves.toBeUndefined();
    });

    it('propagates 400 when no group', async () => {
      service.bulkUpsertGroupFieldValues.mockRejectedValue(
        new BadRequestException(),
      );
      await expect(
        controller.bulkUpsertGroupFieldValues('prod-1', { values: [] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getGroupFieldValues (bulk)', () => {
    it('delegates to service', async () => {
      service.getGroupFieldValuesBulk.mockResolvedValue([
        { fieldId: 'f-1', valueText: 'Tolkien' },
      ]);
      const result = await controller.getGroupFieldValues('prod-1');
      expect(result).toHaveLength(1);
    });

    it('propagates 404 when product not found', async () => {
      service.getGroupFieldValuesBulk.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(controller.getGroupFieldValues('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
