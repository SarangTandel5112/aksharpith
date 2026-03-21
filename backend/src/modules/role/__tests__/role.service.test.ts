import { RoleService } from '../role.service';
import { FakeRoleRepository } from './fakes/fake-role.repository';

describe('RoleService', () => {
  let service: RoleService;
  let repo: FakeRoleRepository;

  beforeEach(() => {
    repo = new FakeRoleRepository();
    service = new RoleService(repo);
  });

  describe('getAllRoles', () => {
    it('returns all active roles', async () => {
      await repo.create({ roleName: 'Admin' });
      await repo.create({ roleName: 'Cashier' });
      const result = await service.getAllRoles();
      expect(result).toHaveLength(2);
    });

    it('excludes soft-deleted roles', async () => {
      const role = await repo.create({ roleName: 'Admin' });
      await repo.delete(role.id);
      const result = await service.getAllRoles();
      expect(result).toHaveLength(0);
    });
  });

  describe('getRoleById', () => {
    it('returns role when found', async () => {
      const created = await repo.create({ roleName: 'Admin' });
      const found = await service.getRoleById(created.id);
      expect(found.roleName).toBe('Admin');
    });

    it('throws when role not found', async () => {
      await expect(service.getRoleById(999)).rejects.toThrow('Role not found');
    });
  });
});
