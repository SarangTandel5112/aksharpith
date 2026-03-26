import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RoleModule } from '../src/modules/role/role.module';
import { Role } from '../src/modules/role/entities/role.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';
import { initE2eApp } from './helpers/init-e2e-app';

// ─── constants ────────────────────────────────────────────────────────────────

const ROLE_ID = 'c1a2b3c4-d5e6-7f80-91ab-cdef12345678';
const OTHER_ROLE_ID = 'd2b3c4d5-e6f7-8091-a2bc-def123456789';

// ─── factory ──────────────────────────────────────────────────────────────────

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: ROLE_ID,
    roleName: 'Manager',
    isActive: true,
    createdAt: new Date('2024-06-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

// ─── mock repo factory ────────────────────────────────────────────────────────

function makeRoleRepoMock() {
  return {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

// ─── suite ────────────────────────────────────────────────────────────────────

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let roleRepo: ReturnType<typeof makeRoleRepoMock>;

  beforeAll(async () => {
    roleRepo = makeRoleRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RoleModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      .overrideProvider(getRepositoryToken(Role))
      .useValue(roleRepo)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await initE2eApp(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── POST /roles ───────────────────────────────────────────────────────────

  describe('POST /roles', () => {
    it('returns 201 with role data on valid input', async () => {
      const dto = { roleName: 'Manager' };
      const created = makeRole();

      // findByName → no conflict
      roleRepo.findOne.mockResolvedValueOnce(null);
      roleRepo.create.mockReturnValue(created);
      roleRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/roles')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: expect.objectContaining({ id: ROLE_ID, roleName: 'Manager' }),
      });
    });

    it('returns 400 when roleName is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 409 when roleName already exists', async () => {
      const dto = { roleName: 'Manager' };
      // findByName returns an existing role → conflict
      roleRepo.findOne.mockResolvedValueOnce(makeRole());

      const res = await request(app.getHttpServer())
        .post('/roles')
        .send(dto);

      expect(res.status).toBe(409);
    });
  });

  // ─── GET /roles ────────────────────────────────────────────────────────────

  describe('GET /roles', () => {
    it('returns 200 with paginated response when roles exist', async () => {
      const role = makeRole();
      roleRepo.findAndCount.mockResolvedValue([[role], 1]);

      const res = await request(app.getHttpServer())
        .get('/roles')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: {
          items: expect.any(Array),
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0]).toMatchObject({
        id: ROLE_ID,
        roleName: 'Manager',
      });
    });

    it('returns 200 with empty items when no roles exist', async () => {
      roleRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/roles')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalPages).toBe(0);
    });
  });

  // ─── GET /roles/:id ────────────────────────────────────────────────────────

  describe('GET /roles/:id', () => {
    it('returns 200 with role data when role exists', async () => {
      roleRepo.findOne.mockResolvedValue(makeRole());

      const res = await request(app.getHttpServer()).get(`/roles/${ROLE_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: ROLE_ID, roleName: 'Manager' });
    });

    it('returns 404 when role is not found', async () => {
      roleRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(`/roles/${ROLE_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).get('/roles/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /roles/:id ──────────────────────────────────────────────────────

  describe('PATCH /roles/:id', () => {
    it('returns 200 with updated role', async () => {
      const updated = makeRole({ roleName: 'Senior Manager' });

      // findOne for findOne(id) existence check inside update()
      roleRepo.findOne.mockResolvedValueOnce(updated);
      // findOne for conflict check (findByName)
      roleRepo.findOne.mockResolvedValueOnce(null);
      // repo.update (no meaningful return needed)
      roleRepo.update.mockResolvedValue({ affected: 1 });
      // findOne after update (findById)
      roleRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/roles/${ROLE_ID}`)
        .send({ roleName: 'Senior Manager' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: ROLE_ID,
        roleName: 'Senior Manager',
      });
    });

    it('returns 404 when the role to update does not exist', async () => {
      roleRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/roles/${ROLE_ID}`)
        .send({ roleName: 'Ghost Role' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /roles/:id ─────────────────────────────────────────────────────

  describe('DELETE /roles/:id', () => {
    it('returns 204 on successful delete', async () => {
      // findOne for the findOne(id) call inside remove()
      roleRepo.findOne.mockResolvedValue(makeRole());
      roleRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(`/roles/${ROLE_ID}`);

      expect(res.status).toBe(204);
    });

    it('returns 404 when role to delete is not found', async () => {
      roleRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(`/roles/${ROLE_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).delete('/roles/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });
});
