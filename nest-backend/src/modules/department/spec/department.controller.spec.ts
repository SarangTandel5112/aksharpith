import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DepartmentController } from '../department.controller';
import { DepartmentService } from '../department.service';

const mockDeptService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let service: ReturnType<typeof mockDeptService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [{ provide: DepartmentService, useFactory: mockDeptService }],
    }).compile();
    controller = module.get(DepartmentController);
    service = module.get(DepartmentService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns paginated result', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await controller.findAll({ page: 1, limit: 10, order: 'ASC' });
    expect(result).toHaveProperty('items');
  });

  it('findOne returns department', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Electronics' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });

  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('create returns new department', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', name: 'Electronics' });
    expect(await controller.create({ name: 'Electronics' })).toHaveProperty('id');
  });

  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ name: 'Dup' })).rejects.toThrow(ConflictException);
  });

  it('update returns updated department', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1', name: 'Updated' });
    expect(await controller.update('uuid-1', { name: 'Updated' })).toHaveProperty('name');
  });

  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });
});
