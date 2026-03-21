import { ProductGroupService } from '../product-group.service';
import { FakeProductGroupRepository } from './fakes/fake-product-group.repository';

describe('ProductGroupService', () => {
  let service: ProductGroupService;
  let repo: FakeProductGroupRepository;

  beforeEach(() => {
    repo = new FakeProductGroupRepository();
    service = new ProductGroupService(repo);
  });

  describe('getAllGroups', () => {
    it('returns paginated product groups', async () => {
      await repo.create({ groupName: 'Electronics' });
      await repo.create({ groupName: 'Clothing' });
      const result = await service.getAllGroups({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('excludes soft-deleted groups', async () => {
      const group = await repo.create({ groupName: 'Electronics' });
      await repo.delete(group.id);
      const result = await service.getAllGroups({});
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getGroupById', () => {
    it('returns product group when found', async () => {
      const created = await repo.create({ groupName: 'Electronics' });
      const found = await service.getGroupById(created.id);
      expect(found.groupName).toBe('Electronics');
    });

    it('throws when product group not found', async () => {
      await expect(service.getGroupById(999)).rejects.toThrow('Product group not found');
    });

    it('throws when product group is soft-deleted', async () => {
      const group = await repo.create({ groupName: 'Electronics' });
      await repo.delete(group.id);
      await expect(service.getGroupById(group.id)).rejects.toThrow('Product group not found');
    });
  });

  describe('createGroup', () => {
    it('creates a product group successfully', async () => {
      const group = await service.createGroup({
        groupName: 'Electronics',
        description: 'All electronics',
      });
      expect(group.groupName).toBe('Electronics');
      expect(group.description).toBe('All electronics');
    });

    it('throws when group name already exists', async () => {
      await repo.create({ groupName: 'Electronics' });
      await expect(
        service.createGroup({ groupName: 'Electronics' })
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateGroup', () => {
    it('updates product group successfully', async () => {
      const created = await repo.create({ groupName: 'Electronics' });
      const updated = await service.updateGroup(created.id, {
        groupName: 'Electronics Updated',
      });
      expect(updated.groupName).toBe('Electronics Updated');
    });

    it('throws when product group not found', async () => {
      await expect(
        service.updateGroup(999, { groupName: 'New Name' })
      ).rejects.toThrow('Product group not found');
    });

    it('throws when new name conflicts with another group', async () => {
      await repo.create({ groupName: 'Clothing' });
      const group2 = await repo.create({ groupName: 'Electronics' });
      await expect(
        service.updateGroup(group2.id, { groupName: 'Clothing' })
      ).rejects.toThrow('already exists');
    });

    it('allows updating group with its own name', async () => {
      const created = await repo.create({ groupName: 'Electronics' });
      const updated = await service.updateGroup(created.id, {
        groupName: 'Electronics',
        description: 'Updated description',
      });
      expect(updated.groupName).toBe('Electronics');
    });
  });

  describe('deleteGroup', () => {
    it('soft-deletes a product group', async () => {
      const created = await repo.create({ groupName: 'Electronics' });
      await service.deleteGroup(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('throws when product group not found', async () => {
      await expect(service.deleteGroup(999)).rejects.toThrow('Product group not found');
    });

    it('throws when group has existing products', async () => {
      const created = await repo.create({ groupName: 'Electronics' });
      repo.hasProducts = true;
      await expect(service.deleteGroup(created.id)).rejects.toThrow(
        'Cannot delete group with existing products'
      );
    });
  });
});
