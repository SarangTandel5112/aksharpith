import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';

const mockCatService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: ReturnType<typeof mockCatService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useFactory: mockCatService }],
    }).compile();
    controller = module.get(CategoryController);
    service = module.get(CategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll delegates to service', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await controller.findAll({ page: 1, limit: 10, order: 'ASC' });
    expect(result).toHaveProperty('items');
  });

  it('findOne returns category', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Clothing' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });

  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('create returns category', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', name: 'Clothing' });
    expect(await controller.create({ name: 'Clothing' })).toHaveProperty('id');
  });

  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ name: 'Dup' })).rejects.toThrow(ConflictException);
  });

  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });
});
