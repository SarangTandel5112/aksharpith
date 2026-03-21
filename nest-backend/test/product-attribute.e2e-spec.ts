import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProductAttributeModule } from '../src/modules/product-attribute/product-attribute.module';
import { ProductAttribute } from '../src/modules/product-attribute/entities/product-attribute.entity';
import { ProductAttributeValue } from '../src/modules/product-attribute/entities/product-attribute-value.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── constants ────────────────────────────────────────────────────────────────

const ATTR_ID = 'a1a2a3a4-b5b6-7c8d-9e0f-aabbccddeeff';
const OTHER_ATTR_ID = 'b2b3b4b5-c6d7-8e9f-0a1b-bbccddeeff00';
const VALUE_ID = 'c3c4c5c6-d7e8-9f0a-1b2c-ccddeeff0011';
const OTHER_VALUE_ID = 'd4d5d6d7-e8f9-0a1b-2c3d-ddeeff001122';

// ─── factories ────────────────────────────────────────────────────────────────

function makeAttribute(overrides: Partial<ProductAttribute> = {}): ProductAttribute {
  return {
    id: ATTR_ID,
    name: 'Color',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    values: [],
    ...overrides,
  };
}

function makeAttributeValue(overrides: Partial<ProductAttributeValue> = {}): ProductAttributeValue {
  return {
    id: VALUE_ID,
    attributeId: ATTR_ID,
    value: 'Red',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    attribute: null as any,
    ...overrides,
  };
}

// ─── mock repo factories ──────────────────────────────────────────────────────

function makeAttrRepoMock() {
  return {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

function makeValueRepoMock() {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

// ─── suite ────────────────────────────────────────────────────────────────────

describe('ProductAttributeController (e2e)', () => {
  let app: INestApplication;
  let attrRepo: ReturnType<typeof makeAttrRepoMock>;
  let valueRepo: ReturnType<typeof makeValueRepoMock>;

  beforeAll(async () => {
    attrRepo = makeAttrRepoMock();
    valueRepo = makeValueRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductAttributeModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      .overrideProvider(getRepositoryToken(ProductAttribute))
      .useValue(attrRepo)
      .overrideProvider(getRepositoryToken(ProductAttributeValue))
      .useValue(valueRepo)
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

  // ─── POST /product-attributes ──────────────────────────────────────────────

  describe('POST /product-attributes', () => {
    it('returns 201 with attribute data on valid input', async () => {
      const dto = { name: 'Color' };
      const created = makeAttribute();

      // findByName → no conflict
      attrRepo.findOne.mockResolvedValueOnce(null);
      attrRepo.create.mockReturnValue(created);
      attrRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/product-attributes')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: expect.objectContaining({ id: ATTR_ID, name: 'Color' }),
      });
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/product-attributes')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 409 when attribute name already exists', async () => {
      const dto = { name: 'Color' };
      // findByName returns existing → conflict
      attrRepo.findOne.mockResolvedValueOnce(makeAttribute());

      const res = await request(app.getHttpServer())
        .post('/product-attributes')
        .send(dto);

      expect(res.status).toBe(409);
    });
  });

  // ─── GET /product-attributes ───────────────────────────────────────────────

  describe('GET /product-attributes', () => {
    it('returns 200 with paginated response when attributes exist', async () => {
      const attr = makeAttribute();
      attrRepo.findAndCount.mockResolvedValue([[attr], 1]);

      const res = await request(app.getHttpServer())
        .get('/product-attributes')
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
      expect(res.body.data.items[0]).toMatchObject({ id: ATTR_ID, name: 'Color' });
    });

    it('returns 200 with empty items when no attributes exist', async () => {
      attrRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/product-attributes')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalPages).toBe(0);
    });
  });

  // ─── GET /product-attributes/:id ──────────────────────────────────────────

  describe('GET /product-attributes/:id', () => {
    it('returns 200 with attribute data when attribute exists', async () => {
      attrRepo.findOne.mockResolvedValue(makeAttribute());

      const res = await request(app.getHttpServer()).get(`/product-attributes/${ATTR_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: ATTR_ID, name: 'Color' });
    });

    it('returns 404 when attribute is not found', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(`/product-attributes/${ATTR_ID}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── GET /product-attributes/:id/values ───────────────────────────────────

  describe('GET /product-attributes/:id/values', () => {
    it('returns 200 with values array when attribute exists', async () => {
      const value = makeAttributeValue();
      const attrWithValues = makeAttribute({ values: [value] });
      // findWithValues calls findOne with relations: ['values']
      attrRepo.findOne.mockResolvedValue(attrWithValues);

      const res = await request(app.getHttpServer()).get(
        `/product-attributes/${ATTR_ID}/values`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: ATTR_ID, name: 'Color' });
      expect(res.body.data.values).toBeInstanceOf(Array);
      expect(res.body.data.values).toHaveLength(1);
      expect(res.body.data.values[0]).toMatchObject({ id: VALUE_ID, value: 'Red' });
    });

    it('returns 200 with empty values array when attribute has no values', async () => {
      const attrNoValues = makeAttribute({ values: [] });
      attrRepo.findOne.mockResolvedValue(attrNoValues);

      const res = await request(app.getHttpServer()).get(
        `/product-attributes/${ATTR_ID}/values`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.values).toBeInstanceOf(Array);
      expect(res.body.data.values).toHaveLength(0);
    });

    it('returns 404 when attribute is not found', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/product-attributes/${ATTR_ID}/values`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── PATCH /product-attributes/:id ────────────────────────────────────────

  describe('PATCH /product-attributes/:id', () => {
    it('returns 200 with updated attribute', async () => {
      const updated = makeAttribute({ name: 'Size' });

      // findOne for findById (existence check inside update → findOne)
      attrRepo.findOne.mockResolvedValueOnce(updated);
      // findOne for conflict check (findByName) — no conflict
      attrRepo.findOne.mockResolvedValueOnce(null);
      // update call
      attrRepo.update.mockResolvedValue({ affected: 1 });
      // findOne after update (findById)
      attrRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/product-attributes/${ATTR_ID}`)
        .send({ name: 'Size' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: ATTR_ID, name: 'Size' });
    });

    it('returns 404 when the attribute to update does not exist', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/product-attributes/${ATTR_ID}`)
        .send({ name: 'Ghost Attribute' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /product-attributes/:id ───────────────────────────────────────

  describe('DELETE /product-attributes/:id', () => {
    it('returns 204 on successful delete', async () => {
      attrRepo.findOne.mockResolvedValue(makeAttribute());
      attrRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(
        `/product-attributes/${ATTR_ID}`,
      );

      expect(res.status).toBe(204);
    });

    it('returns 404 when attribute to delete is not found', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/product-attributes/${ATTR_ID}`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /product-attributes/:id/values ──────────────────────────────────

  describe('POST /product-attributes/:id/values', () => {
    it('returns 201 with the created value on valid input', async () => {
      const attr = makeAttribute();
      const newValue = makeAttributeValue();

      // findOne for attribute existence check (findById)
      attrRepo.findOne.mockResolvedValueOnce(attr);
      // valueRepo.create + save
      valueRepo.create.mockReturnValue(newValue);
      valueRepo.save.mockResolvedValue(newValue);

      const res = await request(app.getHttpServer())
        .post(`/product-attributes/${ATTR_ID}/values`)
        .send({ value: 'Red' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ id: VALUE_ID, value: 'Red' });
    });

    it('returns 404 when attribute is not found', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post(`/product-attributes/${ATTR_ID}/values`)
        .send({ value: 'Red' });

      expect(res.status).toBe(404);
    });

    it('returns 400 when value field is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/product-attributes/${ATTR_ID}/values`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /product-attributes/:id/values/:valueId ────────────────────────

  describe('PATCH /product-attributes/:id/values/:valueId', () => {
    it('returns 200 with updated value', async () => {
      const attr = makeAttribute();
      const existingValue = makeAttributeValue({ attributeId: ATTR_ID });
      const updatedValue = makeAttributeValue({ value: 'Blue' });

      // findOne for attribute existence check
      attrRepo.findOne.mockResolvedValueOnce(attr);
      // findOne for value lookup
      valueRepo.findOne.mockResolvedValueOnce(existingValue);
      // update call
      valueRepo.update.mockResolvedValue({ affected: 1 });
      // findOne for returning updated value
      valueRepo.findOne.mockResolvedValueOnce(updatedValue);

      const res = await request(app.getHttpServer())
        .patch(`/product-attributes/${ATTR_ID}/values/${VALUE_ID}`)
        .send({ value: 'Blue' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: VALUE_ID, value: 'Blue' });
    });

    it('returns 404 when attribute is not found', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/product-attributes/${ATTR_ID}/values/${VALUE_ID}`)
        .send({ value: 'Blue' });

      expect(res.status).toBe(404);
    });

    it('returns 404 when value does not belong to the attribute', async () => {
      const attr = makeAttribute();
      const valueFromOtherAttr = makeAttributeValue({ attributeId: OTHER_ATTR_ID });

      // attribute found
      attrRepo.findOne.mockResolvedValueOnce(attr);
      // value found but belongs to a different attribute
      valueRepo.findOne.mockResolvedValueOnce(valueFromOtherAttr);

      const res = await request(app.getHttpServer())
        .patch(`/product-attributes/${ATTR_ID}/values/${VALUE_ID}`)
        .send({ value: 'Blue' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /product-attributes/:id/values/:valueId ───────────────────────

  describe('DELETE /product-attributes/:id/values/:valueId', () => {
    it('returns 204 on successful value delete', async () => {
      const attr = makeAttribute();
      const value = makeAttributeValue({ attributeId: ATTR_ID });

      attrRepo.findOne.mockResolvedValueOnce(attr);
      valueRepo.findOne.mockResolvedValueOnce(value);
      valueRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(
        `/product-attributes/${ATTR_ID}/values/${VALUE_ID}`,
      );

      expect(res.status).toBe(204);
    });

    it('returns 404 when value does not belong to the attribute', async () => {
      const attr = makeAttribute();
      const valueFromOtherAttr = makeAttributeValue({ attributeId: OTHER_ATTR_ID });

      attrRepo.findOne.mockResolvedValueOnce(attr);
      valueRepo.findOne.mockResolvedValueOnce(valueFromOtherAttr);

      const res = await request(app.getHttpServer()).delete(
        `/product-attributes/${ATTR_ID}/values/${VALUE_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 when attribute is not found', async () => {
      attrRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/product-attributes/${ATTR_ID}/values/${VALUE_ID}`,
      );

      expect(res.status).toBe(404);
    });
  });
});
