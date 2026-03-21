import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RoleController } from '../role.controller';
import { RoleService } from '../role.service';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLE } from '../../../utils/constants';

const mockRoleService = () => ({
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

describe('RoleController', () => {
  let controller: RoleController;
  let service: ReturnType<typeof mockRoleService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: RoleService, useFactory: mockRoleService }],
    }).compile();
    controller = module.get(RoleController);
    service = module.get(RoleService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('delegates to service and returns paginated result', async () => {
      service.findAll.mockResolvedValue(mockPaginated);
      const result = await controller.findAll({
        page: 1,
        limit: 10,
        order: 'ASC',
      });
      expect(result).toEqual(mockPaginated);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        order: 'ASC',
      });
    });
  });

  describe('findOne', () => {
    it('returns role by id', async () => {
      const role = { id: 'uuid-1', roleName: 'Admin' };
      service.findOne.mockResolvedValue(role);
      expect(await controller.findOne('uuid-1')).toEqual(role);
    });

    it('propagates NotFoundException', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Role not found'),
      );
      await expect(controller.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns role', async () => {
      const role = { id: 'uuid-1', roleName: 'Admin' };
      service.create.mockResolvedValue(role);
      expect(await controller.create({ roleName: 'Admin' })).toEqual(role);
    });

    it('propagates ConflictException on duplicate', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Role already exists'),
      );
      await expect(controller.create({ roleName: 'Admin' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('updates role by id', async () => {
      const role = { id: 'uuid-1', roleName: 'Staff' };
      service.update.mockResolvedValue(role);
      expect(await controller.update('uuid-1', { roleName: 'Staff' })).toEqual(
        role,
      );
    });

    it('propagates NotFoundException', async () => {
      service.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update('bad-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes role by id', async () => {
      service.remove.mockResolvedValue(undefined);
      expect(await controller.remove('uuid-1')).toBeUndefined();
    });

    it('propagates NotFoundException', async () => {
      service.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('RBAC metadata', () => {
    it('findAll requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        RoleController.prototype.findAll,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('findOne requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        RoleController.prototype.findOne,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('create requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        RoleController.prototype.create,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('update requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        RoleController.prototype.update,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });

    it('remove requires ADMIN', () => {
      const meta = Reflect.getMetadata(
        Roles.KEY,
        RoleController.prototype.remove,
      );
      expect(meta).toEqual([ROLE.ADMIN]);
    });
  });
});
