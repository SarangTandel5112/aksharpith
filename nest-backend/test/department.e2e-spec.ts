import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DepartmentModule } from '../src/modules/department/department.module';
import { Department } from '../src/modules/department/entities/department.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── constants ────────────────────────────────────────────────────────────────

const DEPT_ID = 'e3f4a5b6-c7d8-9012-bcde-f12345678901';

// ─── factory ──────────────────────────────────────────────────────────────────

function makeDept(overrides: Partial<Department> = {}): Department {
  return {
    id: DEPT_ID,
    name: 'Electronics',
    isActive: true,
    createdAt: new Date('2024-06-15T00:00:00.000Z'),
    updatedAt: new Date('2024-06-15T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

// ─── mock repo factory ────────────────────────────────────────────────────────

function makeDeptRepoMock() {
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

describe('DepartmentController (e2e)', () => {
  let app: INestApplication;
  let deptRepo: ReturnType<typeof makeDeptRepoMock>;

  beforeAll(async () => {
    deptRepo = makeDeptRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DepartmentModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      .overrideProvider(getRepositoryToken(Department))
      .useValue(deptRepo)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── POST /departments ─────────────────────────────────────────────────────

  describe('POST /departments', () => {
    it('returns 201 with department data on valid input', async () => {
      const dto = { name: 'Electronics' };
      const created = makeDept();

      // findByName → no conflict
      deptRepo.findOne.mockResolvedValueOnce(null);
      deptRepo.create.mockReturnValue(created);
      deptRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/departments')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: expect.objectContaining({ id: DEPT_ID, name: 'Electronics' }),
      });
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/departments')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 409 when department name already exists', async () => {
      const dto = { name: 'Electronics' };
      // findByName returns existing department → conflict
      deptRepo.findOne.mockResolvedValueOnce(makeDept());

      const res = await request(app.getHttpServer())
        .post('/departments')
        .send(dto);

      expect(res.status).toBe(409);
    });
  });

  // ─── GET /departments ──────────────────────────────────────────────────────

  describe('GET /departments', () => {
    it('returns 200 with paginated response when departments exist', async () => {
      const dept = makeDept();
      deptRepo.findAndCount.mockResolvedValue([[dept], 1]);

      const res = await request(app.getHttpServer())
        .get('/departments')
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
        id: DEPT_ID,
        name: 'Electronics',
      });
    });

    it('returns 200 with empty items when no departments exist', async () => {
      deptRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/departments')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalPages).toBe(0);
    });
  });

  // ─── GET /departments/:id ──────────────────────────────────────────────────

  describe('GET /departments/:id', () => {
    it('returns 200 with department data when department exists', async () => {
      deptRepo.findOne.mockResolvedValue(makeDept());

      const res = await request(app.getHttpServer()).get(`/departments/${DEPT_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: DEPT_ID, name: 'Electronics' });
    });

    it('returns 404 when department is not found', async () => {
      deptRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(`/departments/${DEPT_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).get('/departments/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /departments/:id ────────────────────────────────────────────────

  describe('PATCH /departments/:id', () => {
    it('returns 200 with updated department', async () => {
      const updated = makeDept({ name: 'Consumer Electronics' });

      // findOne for findOne(id) existence check inside update()
      deptRepo.findOne.mockResolvedValueOnce(updated);
      // findOne for conflict check (findByName)
      deptRepo.findOne.mockResolvedValueOnce(null);
      // repo.update (no meaningful return needed)
      deptRepo.update.mockResolvedValue({ affected: 1 });
      // findOne after update (findById)
      deptRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/departments/${DEPT_ID}`)
        .send({ name: 'Consumer Electronics' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: DEPT_ID,
        name: 'Consumer Electronics',
      });
    });

    it('returns 404 when the department to update does not exist', async () => {
      deptRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/departments/${DEPT_ID}`)
        .send({ name: 'Ghost Department' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /departments/:id ───────────────────────────────────────────────

  describe('DELETE /departments/:id', () => {
    it('returns 204 on successful delete', async () => {
      // findOne for the findOne(id) call inside remove()
      deptRepo.findOne.mockResolvedValue(makeDept());
      deptRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(`/departments/${DEPT_ID}`);

      expect(res.status).toBe(204);
    });

    it('returns 404 when department to delete is not found', async () => {
      deptRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(`/departments/${DEPT_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).delete('/departments/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });
});
