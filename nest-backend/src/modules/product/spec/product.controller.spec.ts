import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLE } from '../../../utils/constants';

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

  describe('RBAC metadata', () => {
    it('findAll requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.findAll,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('getStats requires ADMIN, STAFF', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getStats,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF]);
    });

    it('findOne requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.findOne,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('create requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.create,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('update requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.update,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('remove requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.remove,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('addMedia requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.addMedia,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('getMedia requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getMedia,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('deleteMedia requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.deleteMedia,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('upsertPhysicalAttributes requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.upsertPhysicalAttributes,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('getPhysicalAttributes requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getPhysicalAttributes,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('getMarketingMedia requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getMarketingMedia,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('addMarketingMedia requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.addMarketingMedia,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('removeMarketingMedia requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.removeMarketingMedia,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('getZones requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getZones,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('addZone requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.addZone,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('updateZone requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.updateZone,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('removeZone requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.removeZone,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('getGroupFieldValues requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getGroupFieldValues,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('bulkUpsertGroupFieldValues requires ADMIN, STAFF', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.bulkUpsertGroupFieldValues,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF]);
    });

    it('removeGroupFieldValue requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.removeGroupFieldValue,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('getVendors requires ADMIN, STAFF, VIEWER', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.getVendors,
      );
      expect(meta).toEqual([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER]);
    });

    it('addVendor requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.addVendor,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('updateVendor requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.updateVendor,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('removeVendor requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        ProductController.prototype.removeVendor,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });
  });
});
