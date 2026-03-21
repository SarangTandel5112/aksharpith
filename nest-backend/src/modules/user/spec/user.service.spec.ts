import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

const mockUserRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockUser = {
  id: 'uuid-1',
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed-password',
  roleId: 'role-uuid-1',
  role: { id: 'role-uuid-1', roleName: 'Admin', isActive: true },
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

describe('UserService', () => {
  let service: UserService;
  let repo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useFactory: mockUserRepo },
      ],
    }).compile();
    service = module.get(UserService);
    repo = module.get(UserRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated response with correct structure', async () => {
      repo.findAll.mockResolvedValue([[mockUser], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('returns empty items when no users', async () => {
      repo.findAll.mockResolvedValue([[], 0]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('calculates totalPages = ceil(total / limit)', async () => {
      repo.findAll.mockResolvedValue([[mockUser], 15]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });

    it('maps entity to UserResponseDto', async () => {
      repo.findAll.mockResolvedValue([[mockUser], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.items[0]).toHaveProperty('id', 'uuid-1');
      expect(result.items[0]).toHaveProperty('email', 'john@example.com');
    });
  });

  describe('findOne', () => {
    it('returns UserResponseDto when found', async () => {
      repo.findById.mockResolvedValue(mockUser);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
      expect(result.email).toBe('john@example.com');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('hashes password and creates user successfully', async () => {
      repo.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      repo.create.mockResolvedValue(mockUser);

      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'plaintext',
        roleId: 'role-uuid-1',
      };
      const result = await service.create(dto as any);
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
      expect(result.id).toBe('uuid-1');
    });

    it('throws ConflictException when email already in use', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);
      await expect(
        service.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password1',
          roleId: 'role-uuid-1',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates user successfully', async () => {
      repo.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, firstName: 'Jane' });
      repo.update.mockResolvedValue({ ...mockUser, firstName: 'Jane' });
      const result = await service.update('uuid-1', { firstName: 'Jane' });
      expect(result.firstName).toBe('Jane');
    });

    it('throws NotFoundException when user not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.update('bad-id', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft-deletes user successfully', async () => {
      repo.findById.mockResolvedValue(mockUser);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
      expect(repo.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
