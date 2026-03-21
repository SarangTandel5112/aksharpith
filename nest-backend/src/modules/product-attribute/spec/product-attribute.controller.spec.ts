import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductAttributeController } from '../product-attribute.controller';
import { ProductAttributeService } from '../product-attribute.service';

const mockService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findWithValues: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addValue: jest.fn(),
  updateValue: jest.fn(),
  removeValue: jest.fn(),
});

describe('ProductAttributeController', () => {
  let controller: ProductAttributeController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductAttributeController],
      providers: [{ provide: ProductAttributeService, useFactory: mockService }],
    }).compile();
    controller = module.get(ProductAttributeController);
    service = module.get(ProductAttributeService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns paginated result', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    expect(await controller.findAll({ page: 1, limit: 10, order: 'ASC' })).toHaveProperty(
      'items',
    );
  });
  it('findOne returns attribute', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });
  it('findWithValues returns attribute with values', async () => {
    service.findWithValues.mockResolvedValue({ id: 'uuid-1', values: [] });
    expect(await controller.findWithValues('uuid-1')).toHaveProperty('values');
  });
  it('create returns attribute', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', name: 'Color' });
    expect(await controller.create({ name: 'Color' })).toHaveProperty('id');
  });
  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ name: 'Dup' })).rejects.toThrow(ConflictException);
  });
  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });
  it('addValue delegates to service', async () => {
    service.addValue.mockResolvedValue({ id: 'val-1', value: 'Red' });
    expect(await controller.addValue('uuid-1', { value: 'Red' })).toHaveProperty('id');
  });
  it('updateValue delegates to service', async () => {
    service.updateValue.mockResolvedValue({ id: 'val-1', value: 'Blue' });
    expect(await controller.updateValue('uuid-1', 'val-1', { value: 'Blue' })).toHaveProperty(
      'value',
      'Blue',
    );
  });
  it('removeValue returns undefined', async () => {
    service.removeValue.mockResolvedValue(undefined);
    expect(await controller.removeValue('uuid-1', 'val-1')).toBeUndefined();
  });
  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });
});
