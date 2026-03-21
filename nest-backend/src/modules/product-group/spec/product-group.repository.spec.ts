import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { ProductGroupRepository } from '../product-group.repository';
import { ProductGroup } from '../entities/product-group.entity';
import { GroupField, FieldType } from '../entities/group-field.entity';
import { ProductGroupFieldValue } from '../../product/entities/product-group-field-value.entity';

const mockRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockFieldRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

const mockGroupFieldValueRepo = () => ({ count: jest.fn() });

describe('ProductGroupRepository', () => {
  let groupRepo: ProductGroupRepository;
  let repo: ReturnType<typeof mockRepo>;
  let fieldRepo: ReturnType<typeof mockFieldRepo>;
  let groupFieldValueRepo: ReturnType<typeof mockGroupFieldValueRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductGroupRepository,
        { provide: getRepositoryToken(ProductGroup), useFactory: mockRepo },
        { provide: getRepositoryToken(GroupField), useFactory: mockFieldRepo },
        { provide: getRepositoryToken(ProductGroupFieldValue), useFactory: mockGroupFieldValueRepo },
      ],
    }).compile();
    groupRepo = module.get(ProductGroupRepository);
    repo = module.get(getRepositoryToken(ProductGroup));
    fieldRepo = module.get(getRepositoryToken(GroupField));
    groupFieldValueRepo = module.get(getRepositoryToken(ProductGroupFieldValue));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates page 1 correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('paginates page 2 limit 5 correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('applies ILike search on name', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, search: 'shoe', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: ILike('%shoe%') }),
        }),
      );
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('sorts by name DESC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await groupRepo.findAll({ page: 1, limit: 10, sortBy: 'name', order: 'DESC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { name: 'DESC' } }),
      );
    });
  });

  describe('findById', () => {
    it('returns group when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Apparel' });
      expect(await groupRepo.findById('uuid-1')).toHaveProperty('name', 'Apparel');
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await groupRepo.findById('bad')).toBeNull();
    });
  });

  describe('findWithFields', () => {
    it('loads relations fields and options', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', fields: [] });
      await groupRepo.findWithFields('uuid-1');
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['fields', 'fields.options'] }),
      );
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await groupRepo.findWithFields('bad')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves group', async () => {
      const dto = { name: 'Apparel', fields: [] };
      const group = { id: 'uuid-1', name: 'Apparel' };
      repo.create.mockReturnValue(group);
      repo.save.mockResolvedValue(group);
      expect(await groupRepo.create(dto)).toEqual(group);
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await groupRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await groupRepo.softDelete('bad')).toBe(false);
    });
  });

  describe('addField', () => {
    it('slugifies field name to generate field_key', async () => {
      const dto = { fieldName: 'Burning Time', fieldType: FieldType.NUMBER, isRequired: false, sortOrder: 0 };
      const saved = { id: 'f-1', groupId: 'g-1', fieldKey: 'burning_time', ...dto };
      fieldRepo.create.mockReturnValue(saved);
      fieldRepo.save.mockResolvedValue(saved);
      const result = await groupRepo.addField('g-1', dto);
      expect(result.fieldKey).toBe('burning_time');
    });

    it('uses custom field_key when provided', async () => {
      const dto = { fieldName: 'ISBN Number', fieldKey: 'isbn', fieldType: FieldType.TEXT };
      const saved = { id: 'f-2', groupId: 'g-1', fieldKey: 'isbn', fieldName: 'ISBN Number' };
      fieldRepo.create.mockReturnValue(saved);
      fieldRepo.save.mockResolvedValue(saved);
      const result = await groupRepo.addField('g-1', dto);
      expect(result.fieldKey).toBe('isbn');
    });
  });

  describe('updateField', () => {
    it('updates allowed fields (name, required, filterable, sortOrder)', async () => {
      fieldRepo.update.mockResolvedValue({ affected: 1 });
      fieldRepo.findOne.mockResolvedValue({ id: 'f-1', fieldName: 'Updated', isFilterable: true });
      const result = await groupRepo.updateField('f-1', { fieldName: 'Updated', isFilterable: true });
      expect(result).toHaveProperty('fieldName', 'Updated');
      expect(fieldRepo.update).toHaveBeenCalledWith('f-1', expect.not.objectContaining({ fieldKey: expect.anything() }));
    });
  });

  describe('deleteField', () => {
    it('soft-deletes field', async () => {
      fieldRepo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await groupRepo.deleteField('f-1')).toBe(true);
    });

    it('returns false when field not found', async () => {
      fieldRepo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await groupRepo.deleteField('bad')).toBe(false);
    });
  });

  describe('countFieldValues', () => {
    it('returns count of products with values for field', async () => {
      groupFieldValueRepo.count.mockResolvedValue(23);
      expect(await groupRepo.countFieldValues('f-1')).toBe(23);
    });
  });

  describe('findFieldById', () => {
    it('returns field when found', async () => {
      fieldRepo.findOne.mockResolvedValue({ id: 'f-1', fieldName: 'Author' });
      const result = await groupRepo.findFieldById('f-1');
      expect(result).toHaveProperty('id', 'f-1');
    });

    it('returns null when not found', async () => {
      fieldRepo.findOne.mockResolvedValue(null);
      const result = await groupRepo.findFieldById('bad');
      expect(result).toBeNull();
    });
  });
});
