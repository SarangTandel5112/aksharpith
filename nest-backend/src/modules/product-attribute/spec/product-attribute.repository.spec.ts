import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { ProductAttributeRepository } from '../product-attribute.repository';
import { ProductAttribute } from '../entities/product-attribute.entity';
import { ProductAttributeValue } from '../entities/product-attribute-value.entity';

const mockRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});
const mockValueRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

describe('ProductAttributeRepository', () => {
  let attrRepo: ProductAttributeRepository;
  let repo: ReturnType<typeof mockRepo>;
  let valueRepo: ReturnType<typeof mockValueRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAttributeRepository,
        { provide: getRepositoryToken(ProductAttribute), useFactory: mockRepo },
        { provide: getRepositoryToken(ProductAttributeValue), useFactory: mockValueRepo },
      ],
    }).compile();
    attrRepo = module.get(ProductAttributeRepository);
    repo = module.get(getRepositoryToken(ProductAttribute));
    valueRepo = module.get(getRepositoryToken(ProductAttributeValue));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('paginates correctly', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await attrRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
    it('applies ILike search', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await attrRepo.findAll({ page: 1, limit: 10, search: 'color', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: ILike('%color%') }),
        }),
      );
    });
    it('filters by isActive', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await attrRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns attribute when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Color' });
      expect(await attrRepo.findById('uuid-1')).toHaveProperty('name', 'Color');
    });
    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await attrRepo.findById('bad')).toBeNull();
    });
  });

  describe('findWithValues', () => {
    it('loads values relation', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid-1', values: [] });
      await attrRepo.findWithValues('uuid-1');
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['values'] }),
      );
    });
  });

  describe('create', () => {
    it('creates attribute with nested values', async () => {
      const dto = { name: 'Color', values: [{ value: 'Red' }] };
      const attr = { id: 'uuid-1', name: 'Color' };
      repo.create.mockReturnValue(attr);
      repo.save.mockResolvedValue(attr);
      expect(await attrRepo.create(dto)).toEqual(attr);
    });
  });

  describe('softDelete', () => {
    it('returns true when deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await attrRepo.softDelete('uuid-1')).toBe(true);
    });
    it('returns false when not found', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 });
      expect(await attrRepo.softDelete('bad')).toBe(false);
    });
  });

  describe('addValue', () => {
    it('creates and saves value', async () => {
      const dto = { value: 'Red' };
      const val = { id: 'val-1', attributeId: 'uuid-1', ...dto };
      valueRepo.create.mockReturnValue(val);
      valueRepo.save.mockResolvedValue(val);
      expect(await attrRepo.addValue('uuid-1', dto)).toEqual(val);
    });
  });

  describe('softDeleteValue', () => {
    it('returns true when deleted', async () => {
      valueRepo.softDelete.mockResolvedValue({ affected: 1 });
      expect(await attrRepo.softDeleteValue('val-1')).toBe(true);
    });
  });
});
