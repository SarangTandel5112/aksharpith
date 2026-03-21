import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SubCategoryController } from '../sub-category.controller';
import { SubCategoryService } from '../sub-category.service';

const mockSubCatService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('SubCategoryController', () => {
  let controller: SubCategoryController;
  let service: ReturnType<typeof mockSubCatService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubCategoryController],
      providers: [{ provide: SubCategoryService, useFactory: mockSubCatService }],
    }).compile();
    controller = module.get(SubCategoryController);
    service = module.get(SubCategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll delegates to service', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await controller.findAll({ page: 1, limit: 10, order: 'ASC' });
    expect(result).toHaveProperty('items');
  });

  it('findOne returns sub-category', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1', name: 'T-Shirts' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });

  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('create returns sub-category', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', name: 'T-Shirts' });
    expect(await controller.create({ name: 'T-Shirts', categoryId: 'cat-uuid' })).toHaveProperty('id');
  });

  it('create propagates NotFoundException (category not found)', async () => {
    service.create.mockRejectedValue(new NotFoundException());
    await expect(controller.create({ name: 'X', categoryId: 'bad' })).rejects.toThrow(NotFoundException);
  });

  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ name: 'Dup', categoryId: 'cat-uuid' })).rejects.toThrow(ConflictException);
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
