import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductAttributeService } from '../product-attribute.service';
import { ProductAttributeRepository } from '../product-attribute.repository';

const mockRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findWithValues: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  addValue: jest.fn(),
  findValueById: jest.fn(),
  updateValue: jest.fn(),
  softDeleteValue: jest.fn(),
});

const mockAttr = {
  id: 'uuid-1',
  name: 'Color',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockValue = { id: 'val-1', attributeId: 'uuid-1', value: 'Red', isActive: true };

describe('ProductAttributeService', () => {
  let service: ProductAttributeService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAttributeService,
        { provide: ProductAttributeRepository, useFactory: mockRepo },
      ],
    }).compile();
    service = module.get(ProductAttributeService);
    repo = module.get(ProductAttributeRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockAttr], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns dto when found', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      expect((await service.findOne('uuid-1')).id).toBe('uuid-1');
    });
    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWithValues', () => {
    it('returns attribute with values', async () => {
      repo.findWithValues.mockResolvedValue({ ...mockAttr, values: [] });
      expect(await service.findWithValues('uuid-1')).toHaveProperty('id');
    });
    it('throws NotFoundException', async () => {
      repo.findWithValues.mockResolvedValue(null);
      await expect(service.findWithValues('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates when name unique', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockAttr);
      expect((await service.create({ name: 'Color' })).name).toBe('Color');
    });
    it('throws ConflictException on duplicate', async () => {
      repo.findByName.mockResolvedValue(mockAttr);
      await expect(service.create({ name: 'Color' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates successfully', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockAttr, name: 'Size' });
      expect((await service.update('uuid-1', { name: 'Size' })).name).toBe('Size');
    });
    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad', {})).rejects.toThrow(NotFoundException);
    });
    it('throws ConflictException on name clash', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findByName.mockResolvedValue({ ...mockAttr, id: 'uuid-2' });
      await expect(service.update('uuid-1', { name: 'Conflict' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('soft deletes', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });
    it('throws NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addValue', () => {
    it('adds value to attribute', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.addValue.mockResolvedValue(mockValue);
      expect(await service.addValue('uuid-1', { value: 'Red' })).toHaveProperty('id');
    });
    it('throws NotFoundException when attribute not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.addValue('bad', { value: 'Red' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateValue', () => {
    it('updates value successfully', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findValueById.mockResolvedValue(mockValue);
      repo.updateValue.mockResolvedValue({ ...mockValue, value: 'Blue' });
      expect(await service.updateValue('uuid-1', 'val-1', { value: 'Blue' })).toHaveProperty(
        'value',
        'Blue',
      );
    });
    it('throws NotFoundException when value not found', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findValueById.mockResolvedValue(null);
      await expect(service.updateValue('uuid-1', 'bad', {})).rejects.toThrow(NotFoundException);
    });
    it('throws NotFoundException when value belongs to different attribute', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findValueById.mockResolvedValue({ ...mockValue, attributeId: 'uuid-other' });
      await expect(service.updateValue('uuid-1', 'val-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeValue', () => {
    it('soft deletes value', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findValueById.mockResolvedValue(mockValue);
      repo.softDeleteValue.mockResolvedValue(true);
      await expect(service.removeValue('uuid-1', 'val-1')).resolves.toBeUndefined();
    });
    it('throws NotFoundException when value not found', async () => {
      repo.findById.mockResolvedValue(mockAttr);
      repo.findValueById.mockResolvedValue(null);
      await expect(service.removeValue('uuid-1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
