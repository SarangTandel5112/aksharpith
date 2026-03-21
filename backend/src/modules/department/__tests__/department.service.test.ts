import { DepartmentService } from '../department.service';
import { FakeDepartmentRepository } from './fakes/fake-department.repository';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repo: FakeDepartmentRepository;

  beforeEach(() => {
    repo = new FakeDepartmentRepository();
    service = new DepartmentService(repo);
  });

  describe('getAllDepartments', () => {
    it('returns paginated departments', async () => {
      await repo.create({ departmentName: 'Electronics' });
      await repo.create({ departmentName: 'Clothing' });
      const result = await service.getAllDepartments({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('excludes soft-deleted departments', async () => {
      const dept = await repo.create({ departmentName: 'Electronics' });
      await repo.delete(dept.id);
      const result = await service.getAllDepartments({});
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getDepartmentById', () => {
    it('returns department when found', async () => {
      const created = await repo.create({ departmentName: 'Electronics' });
      const found = await service.getDepartmentById(created.id);
      expect(found.departmentName).toBe('Electronics');
    });

    it('throws when department not found', async () => {
      await expect(service.getDepartmentById(999)).rejects.toThrow('Department not found');
    });

    it('throws when department is soft-deleted', async () => {
      const dept = await repo.create({ departmentName: 'Electronics' });
      await repo.delete(dept.id);
      await expect(service.getDepartmentById(dept.id)).rejects.toThrow('Department not found');
    });
  });

  describe('createDepartment', () => {
    it('creates a department successfully', async () => {
      const dept = await service.createDepartment({
        departmentName: 'Electronics',
        departmentCode: 'ELEC',
      });
      expect(dept.departmentName).toBe('Electronics');
      expect(dept.departmentCode).toBe('ELEC');
    });

    it('throws when department name already exists', async () => {
      await repo.create({ departmentName: 'Electronics' });
      await expect(
        service.createDepartment({ departmentName: 'Electronics' })
      ).rejects.toThrow('already exists');
    });

    it('throws when department code already exists', async () => {
      await repo.create({ departmentName: 'Electronics', departmentCode: 'ELEC' });
      await expect(
        service.createDepartment({ departmentName: 'Electrical', departmentCode: 'ELEC' })
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateDepartment', () => {
    it('updates department successfully', async () => {
      const created = await repo.create({ departmentName: 'Electronics' });
      const updated = await service.updateDepartment(created.id, {
        departmentName: 'Electronics Updated',
      });
      expect(updated.departmentName).toBe('Electronics Updated');
    });

    it('throws when department not found', async () => {
      await expect(
        service.updateDepartment(999, { departmentName: 'New Name' })
      ).rejects.toThrow('Department not found');
    });

    it('throws when new name conflicts with another department', async () => {
      await repo.create({ departmentName: 'Clothing' });
      const dept2 = await repo.create({ departmentName: 'Electronics' });
      await expect(
        service.updateDepartment(dept2.id, { departmentName: 'Clothing' })
      ).rejects.toThrow('already exists');
    });

    it('allows updating department with its own name', async () => {
      const created = await repo.create({
        departmentName: 'Electronics',
        departmentCode: 'ELEC',
      });
      const updated = await service.updateDepartment(created.id, {
        departmentName: 'Electronics',
        description: 'Updated description',
      });
      expect(updated.departmentName).toBe('Electronics');
    });
  });

  describe('deleteDepartment', () => {
    it('soft-deletes a department', async () => {
      const created = await repo.create({ departmentName: 'Electronics' });
      await service.deleteDepartment(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('throws when department not found', async () => {
      await expect(service.deleteDepartment(999)).rejects.toThrow('Department not found');
    });
  });
});
