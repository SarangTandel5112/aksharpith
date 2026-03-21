import { UserService } from '../user.service';
import { FakeUserRepository } from './fakes/fake-user.repository';

describe('UserService', () => {
  let service: UserService;
  let repo: FakeUserRepository;

  beforeEach(() => {
    repo = new FakeUserRepository();
    service = new UserService(repo);
  });

  describe('getAllUsers', () => {
    it('returns paginated users without passwordHash', async () => {
      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'secret',
        roleId: 1,
      });
      await repo.create({
        username: 'bob',
        Firstname: 'Bob',
        Lastname: 'Jones',
        email: 'bob@example.com',
        passwordHash: 'secret2',
        roleId: 1,
      });

      const result = await service.getAllUsers({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      result.data.forEach((u) => {
        expect(u).not.toHaveProperty('passwordHash');
      });
    });

    it('excludes soft-deleted users', async () => {
      const user = await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'secret',
        roleId: 1,
      });
      await repo.delete(user.id);

      const result = await service.getAllUsers({});
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getUserById', () => {
    it('returns user without passwordHash', async () => {
      const created = await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'secret',
        roleId: 1,
      });

      const found = await service.getUserById(created.id);
      expect(found.username).toBe('alice');
      expect(found).not.toHaveProperty('passwordHash');
    });

    it('throws when user not found', async () => {
      await expect(service.getUserById(999)).rejects.toThrow('User not found');
    });

    it('throws when user is soft-deleted', async () => {
      const created = await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'secret',
        roleId: 1,
      });
      await repo.delete(created.id);

      await expect(service.getUserById(created.id)).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('creates a user successfully and returns without passwordHash', async () => {
      const user = await service.createUser({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        password: 'password123',
        roleId: 1,
      });

      expect(user.username).toBe('alice');
      expect(user.email).toBe('alice@example.com');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('throws when email already exists', async () => {
      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed',
        roleId: 1,
      });

      await expect(
        service.createUser({
          username: 'alice2',
          Firstname: 'Alice',
          Lastname: 'Smith',
          email: 'alice@example.com',
          password: 'password123',
          roleId: 1,
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateUser', () => {
    it('updates user successfully and returns without passwordHash', async () => {
      const created = await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed',
        roleId: 1,
      });

      const updated = await service.updateUser(created.id, { Firstname: 'Alicia' });
      expect(updated.Firstname).toBe('Alicia');
      expect(updated).not.toHaveProperty('passwordHash');
    });

    it('throws when user not found', async () => {
      await expect(service.updateUser(999, { Firstname: 'Bob' })).rejects.toThrow('User not found');
    });

    it('throws when email conflicts with another user', async () => {
      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed',
        roleId: 1,
      });
      const user2 = await repo.create({
        username: 'bob',
        Firstname: 'Bob',
        Lastname: 'Jones',
        email: 'bob@example.com',
        passwordHash: 'hashed',
        roleId: 1,
      });

      await expect(
        service.updateUser(user2.id, { email: 'alice@example.com' })
      ).rejects.toThrow('already exists');
    });

    it('allows updating user with its own email', async () => {
      const created = await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed',
        roleId: 1,
      });

      const updated = await service.updateUser(created.id, {
        email: 'alice@example.com',
        Firstname: 'Alicia',
      });
      expect(updated.email).toBe('alice@example.com');
    });
  });

  describe('deleteUser', () => {
    it('soft-deletes a user', async () => {
      const created = await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed',
        roleId: 1,
      });

      await service.deleteUser(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('throws when user not found', async () => {
      await expect(service.deleteUser(999)).rejects.toThrow('User not found');
    });
  });
});
