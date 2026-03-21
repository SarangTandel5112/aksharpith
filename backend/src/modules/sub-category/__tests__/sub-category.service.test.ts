import { SubCategoryService } from '../sub-category.service';
import { FakeSubCategoryRepository } from './fakes/fake-sub-category.repository';

describe('SubCategoryService', () => {
  let service: SubCategoryService;
  let repo: FakeSubCategoryRepository;

  beforeEach(() => {
    repo = new FakeSubCategoryRepository();
    service = new SubCategoryService(repo);
  });

  describe('getAllSubCategories', () => {
    it('returns paginated sub-categories', async () => {
      await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await repo.create({ subCategoryName: 'Laptops', categoryId: 1 });
      const result = await service.getAllSubCategories({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('excludes soft-deleted sub-categories', async () => {
      const sc = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await repo.delete(sc.id);
      const result = await service.getAllSubCategories({});
      expect(result.data).toHaveLength(0);
    });

    it('filters by categoryId when provided', async () => {
      await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await repo.create({ subCategoryName: 'Shirts', categoryId: 2 });
      const result = await service.getAllSubCategories({ categoryId: 1 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].subCategoryName).toBe('Phones');
    });
  });

  describe('getSubCategoryById', () => {
    it('returns sub-category when found', async () => {
      const created = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      const found = await service.getSubCategoryById(created.id);
      expect(found.subCategoryName).toBe('Phones');
    });

    it('throws when sub-category not found', async () => {
      await expect(service.getSubCategoryById(999)).rejects.toThrow('SubCategory not found');
    });

    it('throws when sub-category is soft-deleted', async () => {
      const sc = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await repo.delete(sc.id);
      await expect(service.getSubCategoryById(sc.id)).rejects.toThrow('SubCategory not found');
    });
  });

  describe('createSubCategory', () => {
    it('creates a sub-category successfully', async () => {
      const sc = await service.createSubCategory({ subCategoryName: 'Phones', categoryId: 1 });
      expect(sc.subCategoryName).toBe('Phones');
    });

    it('throws when sub-category name already exists in the same category', async () => {
      await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await expect(
        service.createSubCategory({ subCategoryName: 'Phones', categoryId: 1 })
      ).rejects.toThrow('already exists');
    });

    it('allows same name in a different category', async () => {
      await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      const sc = await service.createSubCategory({ subCategoryName: 'Phones', categoryId: 2 });
      expect(sc.subCategoryName).toBe('Phones');
    });
  });

  describe('updateSubCategory', () => {
    it('updates sub-category successfully', async () => {
      const created = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      const updated = await service.updateSubCategory(created.id, {
        subCategoryName: 'Smartphones',
      });
      expect(updated.subCategoryName).toBe('Smartphones');
    });

    it('throws when sub-category not found', async () => {
      await expect(
        service.updateSubCategory(999, { subCategoryName: 'New Name' })
      ).rejects.toThrow('SubCategory not found');
    });

    it('throws when new name conflicts with another sub-category in the same category', async () => {
      await repo.create({ subCategoryName: 'Laptops', categoryId: 1 });
      const sc2 = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await expect(
        service.updateSubCategory(sc2.id, { subCategoryName: 'Laptops' })
      ).rejects.toThrow('already exists');
    });

    it('allows updating with the same name (no conflict with self)', async () => {
      const created = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      const updated = await service.updateSubCategory(created.id, {
        subCategoryName: 'Phones',
        description: 'Updated description',
      });
      expect(updated.subCategoryName).toBe('Phones');
    });
  });

  describe('deleteSubCategory', () => {
    it('soft-deletes a sub-category', async () => {
      const created = await repo.create({ subCategoryName: 'Phones', categoryId: 1 });
      await service.deleteSubCategory(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('throws when sub-category not found', async () => {
      await expect(service.deleteSubCategory(999)).rejects.toThrow('SubCategory not found');
    });
  });
});
