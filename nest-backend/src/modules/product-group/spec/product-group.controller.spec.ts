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
  addField: jest.fn(),
  updateField: jest.fn(),
  removeField: jest.fn(),
  addOption: jest.fn(),
  updateOption: jest.fn(),
  removeOption: jest.fn(),
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
    await expect(controller.findWithFields('bad')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create returns new group', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', name: 'Apparel' });
    expect(await controller.create({ name: 'Apparel' })).toHaveProperty('id');
  });

  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ name: 'Dup' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('update delegates to service', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1', name: 'Updated' });
    expect(
      await controller.update('uuid-1', { name: 'Updated' }),
    ).toHaveProperty('name');
  });

  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });

  describe('addField', () => {
    it('delegates to service', async () => {
      service.addField.mockResolvedValue({ id: 'f-1', fieldKey: 'author' });
      const result = await controller.addField('g-1', { fieldName: 'Author' });
      expect(result).toHaveProperty('fieldKey', 'author');
      expect(service.addField).toHaveBeenCalledWith('g-1', {
        fieldName: 'Author',
      });
    });

    it('propagates 404', async () => {
      service.addField.mockRejectedValue(new NotFoundException());
      await expect(
        controller.addField('bad', { fieldName: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateField', () => {
    it('delegates to service', async () => {
      service.updateField.mockResolvedValue({ id: 'f-1', isFilterable: true });
      const result = await controller.updateField('g-1', 'f-1', {
        isFilterable: true,
      });
      expect(result).toHaveProperty('isFilterable', true);
    });

    it('propagates 409 when type change blocked', async () => {
      service.updateField.mockRejectedValue(new ConflictException());
      await expect(controller.updateField('g-1', 'f-1', {})).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeField', () => {
    it('delegates to service', async () => {
      service.removeField.mockResolvedValue(undefined);
      await expect(
        controller.removeField('g-1', 'f-1'),
      ).resolves.toBeUndefined();
    });

    it('propagates 409 when values exist', async () => {
      service.removeField.mockRejectedValue(new ConflictException());
      await expect(controller.removeField('g-1', 'f-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('addOption', () => {
    it('delegates to service', async () => {
      service.addOption.mockResolvedValue({ id: 'o-1', optionLabel: 'Hindi' });
      const result = await controller.addOption('g-1', 'f-1', {
        optionLabel: 'Hindi',
        optionValue: 'hi',
      });
      expect(result).toHaveProperty('optionLabel', 'Hindi');
    });

    it('propagates 404', async () => {
      service.addOption.mockRejectedValue(new NotFoundException());
      await expect(
        controller.addOption('bad', 'f-1', {
          optionLabel: 'X',
          optionValue: 'x',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOption', () => {
    it('delegates to service', async () => {
      service.updateOption.mockResolvedValue({
        id: 'o-1',
        optionLabel: 'Updated',
      });
      const result = await controller.updateOption('g-1', 'f-1', 'o-1', {
        optionLabel: 'Updated',
      });
      expect(result).toHaveProperty('optionLabel', 'Updated');
    });
  });

  describe('removeOption', () => {
    it('delegates to service', async () => {
      service.removeOption.mockResolvedValue(undefined);
      await expect(
        controller.removeOption('g-1', 'f-1', 'o-1'),
      ).resolves.toBeUndefined();
    });

    it('propagates 409 when products used option', async () => {
      service.removeOption.mockRejectedValue(new ConflictException());
      await expect(
        controller.removeOption('g-1', 'f-1', 'o-1'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
