import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CategoryModule } from '../src/modules/category/category.module';
import { Category } from '../src/modules/category/entities/category.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const OTHER_CATEGORY_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

// ─── factory ──────────────────────────────────────────────────────────────────

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: CATEGORY_ID,
    name: 'Clothing',
    isActive: true,
    createdAt: new Date('2024-06-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

// ─── mock repo factory ────────────────────────────────────────────────────────

function makeCategoryRepoMock() {
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

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let categoryRepo: ReturnType<typeof makeCategoryRepoMock>;

  beforeAll(async () => {
    categoryRepo = makeCategoryRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoryModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      .overrideProvider(getRepositoryToken(Category))
      .useValue(categoryRepo)
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

  // ─── POST /categories ──────────────────────────────────────────────────────

  describe('POST /categories', () => {
    it('returns 201 with category data on valid input', async () => {
      const dto = { name: 'Clothing' };
      const created = makeCategory();

      // findByName → no conflict
      categoryRepo.findOne.mockResolvedValueOnce(null);
      categoryRepo.create.mockReturnValue(created);
      categoryRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: expect.objectContaining({ id: CATEGORY_ID, name: 'Clothing' }),
      });
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 409 when category name already exists', async () => {
      const dto = { name: 'Clothing' };
      // findByName returns an existing category → conflict
      categoryRepo.findOne.mockResolvedValueOnce(makeCategory());

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send(dto);

      expect(res.status).toBe(409);
    });
  });

  // ─── GET /categories ───────────────────────────────────────────────────────

  describe('GET /categories', () => {
    it('returns 200 with paginated response when categories exist', async () => {
      const category = makeCategory();
      categoryRepo.findAndCount.mockResolvedValue([[category], 1]);

      const res = await request(app.getHttpServer())
        .get('/categories')
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
        id: CATEGORY_ID,
        name: 'Clothing',
      });
    });

    it('returns 200 with empty items when no categories exist', async () => {
      categoryRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/categories')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalPages).toBe(0);
    });
  });

  // ─── GET /categories/:id ───────────────────────────────────────────────────

  describe('GET /categories/:id', () => {
    it('returns 200 with category data when category exists', async () => {
      categoryRepo.findOne.mockResolvedValue(makeCategory());

      const res = await request(app.getHttpServer()).get(`/categories/${CATEGORY_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: CATEGORY_ID, name: 'Clothing' });
    });

    it('returns 404 when category is not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(`/categories/${CATEGORY_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).get('/categories/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /categories/:id ─────────────────────────────────────────────────

  describe('PATCH /categories/:id', () => {
    it('returns 200 with updated category', async () => {
      const updated = makeCategory({ name: 'Footwear' });

      // findOne for findById inside findOne(id) (existence check)
      categoryRepo.findOne.mockResolvedValueOnce(updated);
      // findOne for findByName (conflict check — no conflict)
      categoryRepo.findOne.mockResolvedValueOnce(null);
      // repo.update (no meaningful return needed)
      categoryRepo.update.mockResolvedValue({ affected: 1 });
      // findOne after update (findById inside categoryRepo.update)
      categoryRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/categories/${CATEGORY_ID}`)
        .send({ name: 'Footwear' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: CATEGORY_ID,
        name: 'Footwear',
      });
    });

    it('returns 404 when the category to update does not exist', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/categories/${CATEGORY_ID}`)
        .send({ name: 'Ghost Category' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /categories/:id ────────────────────────────────────────────────

  describe('DELETE /categories/:id', () => {
    it('returns 204 on successful delete', async () => {
      // findOne for the findById call inside findOne(id) inside remove()
      categoryRepo.findOne.mockResolvedValue(makeCategory());
      categoryRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(`/categories/${CATEGORY_ID}`);

      expect(res.status).toBe(204);
    });

    it('returns 404 when category to delete is not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(`/categories/${CATEGORY_ID}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).delete('/categories/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });
});
