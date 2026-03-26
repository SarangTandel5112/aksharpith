import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SubCategoryModule } from '../src/modules/sub-category/sub-category.module';
import { SubCategory } from '../src/modules/sub-category/entities/sub-category.entity';
import { Category } from '../src/modules/category/entities/category.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';
import { initE2eApp } from './helpers/init-e2e-app';

// ─── constants ────────────────────────────────────────────────────────────────

const SUB_CATEGORY_ID = 'c1d2e3f4-a5b6-4890-8def-123456789abc';
const OTHER_SUB_CATEGORY_ID = 'd2e3f4a5-b6c7-4901-9efa-23456789abcd';
const CATEGORY_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const OTHER_CATEGORY_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';

// ─── factories ────────────────────────────────────────────────────────────────

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

function makeSubCategory(overrides: Partial<SubCategory> = {}): SubCategory {
  return {
    id: SUB_CATEGORY_ID,
    name: 'T-Shirts',
    categoryId: CATEGORY_ID,
    category: makeCategory(),
    isActive: true,
    createdAt: new Date('2024-06-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

// ─── mock repo factories ──────────────────────────────────────────────────────

function makeSubCategoryRepoMock() {
  return {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

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

describe('SubCategoryController (e2e)', () => {
  let app: INestApplication;
  let subCategoryRepo: ReturnType<typeof makeSubCategoryRepoMock>;
  let categoryRepo: ReturnType<typeof makeCategoryRepoMock>;

  beforeAll(async () => {
    subCategoryRepo = makeSubCategoryRepoMock();
    categoryRepo = makeCategoryRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SubCategoryModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      .overrideProvider(getRepositoryToken(SubCategory))
      .useValue(subCategoryRepo)
      .overrideProvider(getRepositoryToken(Category))
      .useValue(categoryRepo)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await initE2eApp(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── POST /sub-categories ──────────────────────────────────────────────────

  describe('POST /sub-categories', () => {
    it('returns 201 with sub-category data on valid input', async () => {
      const dto = { name: 'T-Shirts', categoryId: CATEGORY_ID };
      const created = makeSubCategory();

      // categoryService.findOne → categoryRepo.findById → categoryRepo.findOne
      categoryRepo.findOne.mockResolvedValueOnce(makeCategory());
      // subCatRepo.findByNameAndCategory → no conflict
      subCategoryRepo.findOne.mockResolvedValueOnce(null);
      subCategoryRepo.create.mockReturnValue(created);
      subCategoryRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/sub-categories')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: expect.objectContaining({
          id: SUB_CATEGORY_ID,
          name: 'T-Shirts',
          categoryId: CATEGORY_ID,
        }),
      });
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/sub-categories')
        .send({ categoryId: CATEGORY_ID });

      expect(res.status).toBe(400);
    });

    it('returns 400 when categoryId is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/sub-categories')
        .send({ name: 'T-Shirts' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when categoryId is not a valid UUID', async () => {
      const res = await request(app.getHttpServer())
        .post('/sub-categories')
        .send({ name: 'T-Shirts', categoryId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });

    it('returns 404 when categoryId does not correspond to an existing category', async () => {
      // categoryService.findOne → categoryRepo.findById → returns null → throws 404
      categoryRepo.findOne.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .post('/sub-categories')
        .send({ name: 'T-Shirts', categoryId: CATEGORY_ID });

      expect(res.status).toBe(404);
    });

    it('returns 409 on duplicate (name, categoryId)', async () => {
      const dto = { name: 'T-Shirts', categoryId: CATEGORY_ID };

      // categoryService.findOne → category exists
      categoryRepo.findOne.mockResolvedValueOnce(makeCategory());
      // findByNameAndCategory → returns existing sub-category → conflict
      subCategoryRepo.findOne.mockResolvedValueOnce(makeSubCategory());

      const res = await request(app.getHttpServer())
        .post('/sub-categories')
        .send(dto);

      expect(res.status).toBe(409);
    });
  });

  // ─── GET /sub-categories ───────────────────────────────────────────────────

  describe('GET /sub-categories', () => {
    it('returns 200 with paginated response when sub-categories exist', async () => {
      const subCategory = makeSubCategory();
      subCategoryRepo.findAndCount.mockResolvedValue([[subCategory], 1]);

      const res = await request(app.getHttpServer())
        .get('/sub-categories')
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
        id: SUB_CATEGORY_ID,
        name: 'T-Shirts',
        categoryId: CATEGORY_ID,
      });
    });

    it('returns 200 with empty items when no sub-categories exist', async () => {
      subCategoryRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/sub-categories')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalPages).toBe(0);
    });
  });

  // ─── GET /sub-categories/:id ───────────────────────────────────────────────

  describe('GET /sub-categories/:id', () => {
    it('returns 200 with sub-category data when sub-category exists', async () => {
      subCategoryRepo.findOne.mockResolvedValue(makeSubCategory());

      const res = await request(app.getHttpServer()).get(
        `/sub-categories/${SUB_CATEGORY_ID}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: SUB_CATEGORY_ID,
        name: 'T-Shirts',
        categoryId: CATEGORY_ID,
      });
    });

    it('returns 404 when sub-category is not found', async () => {
      subCategoryRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/sub-categories/${SUB_CATEGORY_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).get(
        '/sub-categories/not-a-uuid',
      );

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /sub-categories/:id ─────────────────────────────────────────────

  describe('PATCH /sub-categories/:id', () => {
    it('returns 200 with updated sub-category name', async () => {
      const updated = makeSubCategory({ name: 'Polo Shirts' });

      // subCatRepo.findById — existence check
      subCategoryRepo.findOne.mockResolvedValueOnce(makeSubCategory());
      // findByNameAndCategory — no conflict
      subCategoryRepo.findOne.mockResolvedValueOnce(null);
      // subCatRepo.update → repo.update (no return)
      subCategoryRepo.update.mockResolvedValue({ affected: 1 });
      // subCatRepo.update → findById after update
      subCategoryRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/sub-categories/${SUB_CATEGORY_ID}`)
        .send({ name: 'Polo Shirts' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: SUB_CATEGORY_ID,
        name: 'Polo Shirts',
        categoryId: CATEGORY_ID,
      });
    });

    it('returns 200 when changing categoryId to a valid category', async () => {
      const updated = makeSubCategory({ categoryId: OTHER_CATEGORY_ID });

      // subCatRepo.findById — existence check
      subCategoryRepo.findOne.mockResolvedValueOnce(makeSubCategory());
      // categoryService.findOne → categoryRepo.findById for the new categoryId
      categoryRepo.findOne.mockResolvedValueOnce(
        makeCategory({ id: OTHER_CATEGORY_ID }),
      );
      // findByNameAndCategory — no conflict
      subCategoryRepo.findOne.mockResolvedValueOnce(null);
      // subCatRepo.update → repo.update
      subCategoryRepo.update.mockResolvedValue({ affected: 1 });
      // subCatRepo.update → findById after update
      subCategoryRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/sub-categories/${SUB_CATEGORY_ID}`)
        .send({ categoryId: OTHER_CATEGORY_ID });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: SUB_CATEGORY_ID,
        categoryId: OTHER_CATEGORY_ID,
      });
    });

    it('returns 404 when the sub-category to update does not exist', async () => {
      subCategoryRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/sub-categories/${SUB_CATEGORY_ID}`)
        .send({ name: 'Ghost Sub-Category' });

      expect(res.status).toBe(404);
    });

    it('returns 404 when the new categoryId does not exist', async () => {
      // subCatRepo.findById — sub-category exists
      subCategoryRepo.findOne.mockResolvedValueOnce(makeSubCategory());
      // categoryService.findOne → categoryRepo.findById → returns null → throws 404
      categoryRepo.findOne.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .patch(`/sub-categories/${SUB_CATEGORY_ID}`)
        .send({ categoryId: OTHER_CATEGORY_ID });

      expect(res.status).toBe(404);
    });

    it('returns 409 when updating would create a duplicate (name, categoryId)', async () => {
      const conflicting = makeSubCategory({ id: OTHER_SUB_CATEGORY_ID });

      // subCatRepo.findById — existence check
      subCategoryRepo.findOne.mockResolvedValueOnce(makeSubCategory());
      // findByNameAndCategory — returns a different sub-category with same name+category → conflict
      subCategoryRepo.findOne.mockResolvedValueOnce(conflicting);

      const res = await request(app.getHttpServer())
        .patch(`/sub-categories/${SUB_CATEGORY_ID}`)
        .send({ name: 'T-Shirts' });

      expect(res.status).toBe(409);
    });
  });

  // ─── DELETE /sub-categories/:id ────────────────────────────────────────────

  describe('DELETE /sub-categories/:id', () => {
    it('returns 204 on successful delete', async () => {
      // findOne for the findById call inside findOne(id) inside remove()
      subCategoryRepo.findOne.mockResolvedValue(makeSubCategory());
      subCategoryRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(
        `/sub-categories/${SUB_CATEGORY_ID}`,
      );

      expect(res.status).toBe(204);
    });

    it('returns 404 when sub-category to delete is not found', async () => {
      subCategoryRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/sub-categories/${SUB_CATEGORY_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/sub-categories/not-a-uuid',
      );

      expect(res.status).toBe(400);
    });
  });
});
