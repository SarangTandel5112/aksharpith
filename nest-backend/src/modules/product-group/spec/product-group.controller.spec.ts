import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductGroupController } from '../product-group.controller';
import { ProductGroupService } from '../product-group.service';

const mockService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findWithFields: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ProductGroupController', () => {
  let controller: ProductGroupController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductGroupController],
      providers: [{ provide: ProductGroupService, useFactory: mockService }],
    }).compile();
    controller = module.get(ProductGroupController);
    service = module.get(ProductGroupService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns paginated result', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    expect(await controller.findAll({ page: 1, limit: 10, order: 'ASC' })).toHaveProperty('items');
  });

  it('findOne returns group', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Apparel' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });

  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('findWithFields returns group with fields', async () => {
    service.findWithFields.mockResolvedValue({ id: 'uuid-1', fields: [] });
    expect(await controller.findWithFields('uuid-1')).toHaveProperty('fields');
  });

  it('findWithFields propagates NotFoundException', async () => {
    service.findWithFields.mockRejectedValue(new NotFoundException());
    await expect(controller.findWithFields('bad')).rejects.toThrow(NotFoundException);
  });

  it('create returns new group', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', name: 'Apparel' });
    expect(await controller.create({ name: 'Apparel' })).toHaveProperty('id');
  });

  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ name: 'Dup' })).rejects.toThrow(ConflictException);
  });

  it('update delegates to service', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1', name: 'Updated' });
    expect(await controller.update('uuid-1', { name: 'Updated' })).toHaveProperty('name');
  });

  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });
});
