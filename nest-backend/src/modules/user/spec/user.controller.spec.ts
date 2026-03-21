import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

const mockUserService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockPaginated = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const mockUserDto = {
  id: 'uuid-1',
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  email: 'john@example.com',
  roleId: 'role-uuid-1',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('UserController', () => {
  let controller: UserController;
  let service: ReturnType<typeof mockUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useFactory: mockUserService }],
    }).compile();
    controller = module.get(UserController);
    service = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('delegates to service and returns paginated result', async () => {
      service.findAll.mockResolvedValue(mockPaginated);
      const result = await controller.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result).toEqual(mockPaginated);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        order: 'ASC',
      });
    });
  });

  describe('findOne', () => {
    it('returns user by id', async () => {
      service.findOne.mockResolvedValue(mockUserDto);
      expect(await controller.findOne('uuid-1')).toEqual(mockUserDto);
      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
    });

    it('propagates NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns user', async () => {
      service.create.mockResolvedValue(mockUserDto);
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password1',
        roleId: 'role-uuid-1',
      };
      expect(await controller.create(dto as any)).toEqual(mockUserDto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('propagates ConflictException on duplicate email', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Email already in use'),
      );
      await expect(
        controller.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password1',
          roleId: 'role-uuid-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates user by id', async () => {
      const updated = { ...mockUserDto, firstName: 'Jane' };
      service.update.mockResolvedValue(updated);
      expect(
        await controller.update('uuid-1', { firstName: 'Jane' }),
      ).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('uuid-1', { firstName: 'Jane' });
    });

    it('propagates NotFoundException', async () => {
      service.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update('bad-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes user by id', async () => {
      service.remove.mockResolvedValue(undefined);
      expect(await controller.remove('uuid-1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('uuid-1');
    });

    it('propagates NotFoundException', async () => {
      service.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
