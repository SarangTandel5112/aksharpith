import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductGroupService } from '../product-group.service';
import { ProductGroupRepository } from '../product-group.repository';

const mockGroupRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findWithFields: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  addField: jest.fn(),
  findFieldById: jest.fn(),
  updateField: jest.fn(),
  deleteField: jest.fn(),
  countFieldValues: jest.fn(),
  addOption: jest.fn(),
  updateOption: jest.fn(),
  deleteOption: jest.fn(),
  countOptionUsage: jest.fn(),
  findOptionById: jest.fn(),
});

const mockGroup = {
  id: 'uuid-1',
  name: 'Apparel',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('ProductGroupService', () => {
  let service: ProductGroupService;
  let repo: ReturnType<typeof mockGroupRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductGroupService,
        { provide: ProductGroupRepository, useFactory: mockGroupRepo },
      ],
    }).compile();
    service = module.get(ProductGroupService);
    repo = module.get(ProductGroupRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockGroup], 1]);
      const result = await service.findAll({
        page: 1,
        limit: 10,
        order: 'ASC',
      });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('calculates totalPages correctly', async () => {
      repo.findAll.mockResolvedValue([[mockGroup], 11]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns dto when found', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWithFields', () => {
    it('returns dto with fields when found', async () => {
      repo.findWithFields.mockResolvedValue({ ...mockGroup, fields: [] });
      const result = await service.findWithFields('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findWithFields.mockResolvedValue(null);
      await expect(service.findWithFields('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates group when name unique', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockGroup);
      const result = await service.create({ name: 'Apparel' });
      expect(result.name).toBe('Apparel');
    });

    it('throws ConflictException on duplicate name', async () => {
      repo.findByName.mockResolvedValue(mockGroup);
      await expect(service.create({ name: 'Apparel' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockGroup, name: 'Updated' });
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when name taken by other group', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      repo.findByName.mockResolvedValue({ ...mockGroup, id: 'uuid-2' });
      await expect(
        service.update('uuid-1', { name: 'Conflict' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft deletes', async () => {
      repo.findById.mockResolvedValue(mockGroup);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addField', () => {
    it('adds field to existing group', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1', name: 'Books' });
      repo.addField.mockResolvedValue({ id: 'f-1', fieldKey: 'author' });
      const result = await service.addField('g-1', { fieldName: 'Author' });
      expect(result).toHaveProperty('fieldKey', 'author');
    });

    it('throws 404 if group not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.addField('bad', { fieldName: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateField', () => {
    it('blocks field_type change if values exist', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({
        id: 'f-1',
        fieldType: 'text',
        groupId: 'g-1',
      });
      repo.countFieldValues.mockResolvedValue(5);
      await expect(
        service.updateField('g-1', 'f-1', { fieldType: 'number' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('allows field_type change if no values exist', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({
        id: 'f-1',
        fieldType: 'text',
        groupId: 'g-1',
      });
      repo.countFieldValues.mockResolvedValue(0);
      repo.updateField.mockResolvedValue({ id: 'f-1', fieldType: 'number' });
      const result = await service.updateField('g-1', 'f-1', {
        fieldType: 'number',
      } as any);
      expect(result).toHaveProperty('fieldType', 'number');
    });

    it('throws 404 if field not found', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue(null);
      await expect(service.updateField('g-1', 'f-1', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws 404 if field belongs to different group', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({
        id: 'f-1',
        fieldType: 'text',
        groupId: 'other-group',
      });
      await expect(service.updateField('g-1', 'f-1', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeField', () => {
    it('blocks deletion if values exist', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.countFieldValues.mockResolvedValue(3);
      await expect(service.removeField('g-1', 'f-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('deletes field when no values exist', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.countFieldValues.mockResolvedValue(0);
      repo.deleteField.mockResolvedValue(true);
      await expect(service.removeField('g-1', 'f-1')).resolves.toBeUndefined();
    });

    it('throws 404 if field not found', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue(null);
      await expect(service.removeField('g-1', 'f-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws 404 if group not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.removeField('bad', 'f-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws 404 if field belongs to different group', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({
        id: 'f-1',
        groupId: 'other-group',
      });
      await expect(service.removeField('g-1', 'f-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addOption', () => {
    it('adds option to existing field in group', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({
        id: 'f-1',
        groupId: 'g-1',
        fieldType: 'dropdown',
      });
      repo.addOption.mockResolvedValue({
        id: 'o-1',
        optionLabel: 'Hindi',
        optionValue: 'hi',
      });
      const result = await service.addOption('g-1', 'f-1', {
        optionLabel: 'Hindi',
        optionValue: 'hi',
      });
      expect(result).toHaveProperty('optionLabel', 'Hindi');
    });

    it('throws 404 if group not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.addOption('bad', 'f-1', { optionLabel: 'X', optionValue: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 404 if field not found', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue(null);
      await expect(
        service.addOption('g-1', 'bad', { optionLabel: 'X', optionValue: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOption', () => {
    it('updates option', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.findOptionById.mockResolvedValue({ id: 'o-1', fieldId: 'f-1' });
      repo.updateOption.mockResolvedValue({
        id: 'o-1',
        optionLabel: 'Updated',
      });
      const result = await service.updateOption('g-1', 'f-1', 'o-1', {
        optionLabel: 'Updated',
      });
      expect(result).toHaveProperty('optionLabel', 'Updated');
    });

    it('throws 404 if group not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.updateOption('bad', 'f-1', 'o-1', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 404 if field not found in group', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue(null);
      await expect(
        service.updateOption('g-1', 'bad', 'o-1', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 404 if option not found', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.findOptionById.mockResolvedValue(null);
      await expect(
        service.updateOption('g-1', 'f-1', 'bad', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeOption', () => {
    it('blocks deletion if products used this option', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.findOptionById.mockResolvedValue({ id: 'o-1', fieldId: 'f-1' });
      repo.countOptionUsage.mockResolvedValue(8);
      await expect(service.removeOption('g-1', 'f-1', 'o-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('deletes option when no products used it', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.findOptionById.mockResolvedValue({ id: 'o-1', fieldId: 'f-1' });
      repo.countOptionUsage.mockResolvedValue(0);
      repo.deleteOption.mockResolvedValue(true);
      await expect(
        service.removeOption('g-1', 'f-1', 'o-1'),
      ).resolves.toBeUndefined();
    });

    it('throws 404 if option not found', async () => {
      repo.findById.mockResolvedValue({ id: 'g-1' });
      repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
      repo.findOptionById.mockResolvedValue(null);
      await expect(service.removeOption('g-1', 'f-1', 'o-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
