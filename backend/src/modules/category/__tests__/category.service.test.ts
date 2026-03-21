import { CategoryService } from '../category.service';
import { FakeCategoryRepository } from './fakes/fake-category.repository';

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: FakeCategoryRepository;

  beforeEach(() => {
    repo = new FakeCategoryRepository();
    service = new CategoryService(repo);
  });

  describe('getAllCategories', () => {
    it('returns paginated categories', async () => {
      await repo.create({ categoryName: 'Electronics' });
      await repo.create({ categoryName: 'Clothing' });
      const result = await service.getAllCategories({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('excludes soft-deleted categories', async () => {
      const cat = await repo.create({ categoryName: 'Electronics' });
      await repo.delete(cat.id);
      const result = await service.getAllCategories({});
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getCategoryById', () => {
    it('returns category when found', async () => {
      const created = await repo.create({ categoryName: 'Electronics' });
      const found = await service.getCategoryById(created.id);
      expect(found.categoryName).toBe('Electronics');
    });

    it('throws when category not found', async () => {
      await expect(service.getCategoryById(999)).rejects.toThrow('Category not found');
    });

    it('throws when category is soft-deleted', async () => {
      const cat = await repo.create({ categoryName: 'Electronics' });
      await repo.delete(cat.id);
      await expect(service.getCategoryById(cat.id)).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('creates a category successfully', async () => {
      const cat = await service.createCategory({ categoryName: 'Electronics' });
      expect(cat.categoryName).toBe('Electronics');
    });

    it('throws when category name already exists', async () => {
      await repo.create({ categoryName: 'Electronics' });
      await expect(
        service.createCategory({ categoryName: 'Electronics' })
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateCategory', () => {
    it('updates category successfully', async () => {
      const created = await repo.create({ categoryName: 'Electronics' });
      const updated = await service.updateCategory(created.id, {
        categoryName: 'Electronics Updated',
      });
      expect(updated.categoryName).toBe('Electronics Updated');
    });

    it('throws when category not found', async () => {
      await expect(
        service.updateCategory(999, { categoryName: 'New Name' })
      ).rejects.toThrow('Category not found');
    });

    it('throws when new name conflicts with another category', async () => {
      await repo.create({ categoryName: 'Clothing' });
      const cat2 = await repo.create({ categoryName: 'Electronics' });
      await expect(
        service.updateCategory(cat2.id, { categoryName: 'Clothing' })
      ).rejects.toThrow('already exists');
    });

    it('allows updating category with its own name', async () => {
      const created = await repo.create({ categoryName: 'Electronics' });
      const updated = await service.updateCategory(created.id, {
        categoryName: 'Electronics',
        description: 'Updated description',
      });
      expect(updated.categoryName).toBe('Electronics');
    });
  });

  describe('deleteCategory', () => {
    it('soft-deletes a category', async () => {
      const created = await repo.create({ categoryName: 'Electronics' });
      await service.deleteCategory(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('throws when category not found', async () => {
      await expect(service.deleteCategory(999)).rejects.toThrow('Category not found');
    });
  });
});
