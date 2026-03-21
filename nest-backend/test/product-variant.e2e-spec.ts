import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProductVariantModule } from '../src/modules/product-variant/product-variant.module';
import { ProductVariantRepository } from '../src/modules/product-variant/product-variant.repository';
import { Product } from '../src/modules/product/entities/product.entity';
import { ProductAttributeValue } from '../src/modules/product-attribute/entities/product-attribute-value.entity';
import { ProductVariant } from '../src/modules/product-variant/entities/product-variant.entity';
import { ProductVariantAttribute } from '../src/modules/product-variant/entities/product-variant-attribute.entity';
import { ProductVariantMedia } from '../src/modules/product-variant/entities/product-variant-media.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── constants ────────────────────────────────────────────────────────────────

const PRODUCT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const VARIANT_ID = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
const ATTR_ID = 'cccccccc-dddd-4eee-8fff-000000000000';
const VALUE_ID_1 = 'dddddddd-eeee-4fff-8000-111111111111';
const VALUE_ID_2 = 'eeeeeeee-ffff-4000-8111-222222222222';
const COMBO_HASH = 'abc123hash';

// ─── factories ────────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: PRODUCT_ID,
    name: 'Test Product',
    sku: 'SKU-001',
    description: null,
    productType: 'variable' as any,
    basePrice: 10.0,
    stockQuantity: 100,
    departmentId: null,
    subCategoryId: null,
    groupId: null,
    itemInactive: false,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    department: null as any,
    subCategory: null as any,
    ...overrides,
  };
}

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: VARIANT_ID,
    productId: PRODUCT_ID,
    product: null as any,
    sku: 'VARIANT-SKU-001',
    price: 15.99,
    stockQuantity: 50,
    combinationHash: COMBO_HASH,
    isDeleted: false,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    variantAttributes: [],
    media: [],
    ...overrides,
  };
}

function makeAttributeValue(
  overrides: Partial<ProductAttributeValue> = {},
): ProductAttributeValue {
  return {
    id: VALUE_ID_1,
    attributeId: ATTR_ID,
    attribute: null as any,
    value: 'Red',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

// ─── mock factories ───────────────────────────────────────────────────────────

function makeVariantRepoMock() {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCombinationHash: jest.fn(),
    createWithAttributes: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    addMedia: jest.fn(),
    getMedia: jest.fn(),
    removeMedia: jest.fn(),
  };
}

function makeTypeOrmRepoMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    findByIds: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findAndCount: jest.fn(),
  };
}

// ─── suite ────────────────────────────────────────────────────────────────────

describe('ProductVariantController (e2e)', () => {
  let app: INestApplication;
  let variantRepo: ReturnType<typeof makeVariantRepoMock>;
  let productRepo: ReturnType<typeof makeTypeOrmRepoMock>;
  let attributeValueRepo: ReturnType<typeof makeTypeOrmRepoMock>;
  let variantTypeOrmRepo: ReturnType<typeof makeTypeOrmRepoMock>;
  let variantMediaTypeOrmRepo: ReturnType<typeof makeTypeOrmRepoMock>;
  let variantAttributeTypeOrmRepo: ReturnType<typeof makeTypeOrmRepoMock>;

  beforeAll(async () => {
    variantRepo = makeVariantRepoMock();
    productRepo = makeTypeOrmRepoMock();
    attributeValueRepo = makeTypeOrmRepoMock();
    variantTypeOrmRepo = makeTypeOrmRepoMock();
    variantMediaTypeOrmRepo = makeTypeOrmRepoMock();
    variantAttributeTypeOrmRepo = makeTypeOrmRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductVariantModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      // ProductVariantRepository is an @Injectable() custom class — override directly
      .overrideProvider(ProductVariantRepository)
      .useValue(variantRepo)
      // TypeORM entity repos used by ProductVariantService
      .overrideProvider(getRepositoryToken(Product))
      .useValue(productRepo)
      .overrideProvider(getRepositoryToken(ProductAttributeValue))
      .useValue(attributeValueRepo)
      // TypeORM entity repos injected inside ProductVariantRepository
      .overrideProvider(getRepositoryToken(ProductVariant))
      .useValue(variantTypeOrmRepo)
      .overrideProvider(getRepositoryToken(ProductVariantMedia))
      .useValue(variantMediaTypeOrmRepo)
      .overrideProvider(getRepositoryToken(ProductVariantAttribute))
      .useValue(variantAttributeTypeOrmRepo)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── GET /products/:productId/variants ────────────────────────────────────

  describe('GET /products/:productId/variants', () => {
    it('returns 200 with paginated list when product exists', async () => {
      const variant = makeVariant();
      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findAll.mockResolvedValue({
        items: [variant],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`/products/${PRODUCT_ID}/variants`)
        .query({ page: 1, limit: 20 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: {
          items: expect.any(Array),
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0]).toMatchObject({
        id: VARIANT_ID,
        sku: 'VARIANT-SKU-001',
      });
    });

    it('returns 404 when product is not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/variants`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── GET /products/:productId/variants/:id ────────────────────────────────

  describe('GET /products/:productId/variants/:id', () => {
    it('returns 200 with variant data when both product and variant exist', async () => {
      const variant = makeVariant();
      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findById.mockResolvedValue(variant);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: VARIANT_ID,
        sku: 'VARIANT-SKU-001',
      });
    });

    it('returns 404 when product is not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 when variant is not found', async () => {
      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 when variant belongs to a different product', async () => {
      const variantOtherProduct = makeVariant({
        productId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      });
      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findById.mockResolvedValue(variantOtherProduct);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /products/:productId/variants ───────────────────────────────────

  describe('POST /products/:productId/variants', () => {
    it('returns 201 with created variant on valid input', async () => {
      const dto = {
        sku: 'VARIANT-NEW',
        price: 19.99,
        stockQuantity: 10,
        attributeValueIds: [VALUE_ID_1],
      };
      const created = makeVariant({ sku: 'VARIANT-NEW', price: 19.99 });
      const attrValue = makeAttributeValue();

      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findByCombinationHash.mockResolvedValue(null);
      attributeValueRepo.findByIds.mockResolvedValue([attrValue]);
      variantRepo.createWithAttributes.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        id: VARIANT_ID,
        sku: 'VARIANT-NEW',
      });
    });

    it('returns 404 when product is not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send({
          sku: 'VARIANT-NEW',
          price: 19.99,
          attributeValueIds: [VALUE_ID_1],
        });

      expect(res.status).toBe(404);
    });

    it('returns 409 when variant with same attribute combination already exists', async () => {
      const existingVariant = makeVariant({
        isDeleted: false,
        deletedAt: null,
      });

      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findByCombinationHash.mockResolvedValue(existingVariant);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send({
          sku: 'VARIANT-DUPE',
          price: 10.0,
          attributeValueIds: [VALUE_ID_1],
        });

      expect(res.status).toBe(409);
    });

    it('returns 400 when sku is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send({
          price: 10.0,
          attributeValueIds: [VALUE_ID_1],
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 when price is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send({
          sku: 'VARIANT-NO-PRICE',
          attributeValueIds: [VALUE_ID_1],
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 when attributeValueIds is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send({
          sku: 'VARIANT-NO-ATTRS',
          price: 10.0,
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 when attributeValueIds is an empty array', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants`)
        .send({
          sku: 'VARIANT-EMPTY-ATTRS',
          price: 10.0,
          attributeValueIds: [],
        });

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /products/:productId/variants/:id ──────────────────────────────

  describe('PATCH /products/:productId/variants/:id', () => {
    it('returns 200 with updated variant', async () => {
      const variant = makeVariant();
      const updatedVariant = makeVariant({ sku: 'VARIANT-UPDATED' });

      // findOne for ensureProductExists
      productRepo.findOne.mockResolvedValue(makeProduct());
      // findById for findOne check
      variantRepo.findById.mockResolvedValueOnce(variant);
      variantRepo.update.mockResolvedValue(undefined);
      // findById after update
      variantRepo.findById.mockResolvedValueOnce(updatedVariant);

      const res = await request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}/variants/${VARIANT_ID}`)
        .send({ sku: 'VARIANT-UPDATED' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: VARIANT_ID,
        sku: 'VARIANT-UPDATED',
      });
    });

    it('returns 404 when product is not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}/variants/${VARIANT_ID}`)
        .send({ sku: 'VARIANT-GHOST' });

      expect(res.status).toBe(404);
    });

    it('returns 404 when variant is not found', async () => {
      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}/variants/${VARIANT_ID}`)
        .send({ sku: 'VARIANT-GHOST' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /products/:productId/variants/:id ─────────────────────────────

  describe('DELETE /products/:productId/variants/:id', () => {
    it('returns 204 on successful delete', async () => {
      const variant = makeVariant();

      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findById.mockResolvedValue(variant);
      variantRepo.softDelete.mockResolvedValue(true);

      const res = await request(app.getHttpServer()).delete(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(204);
    });

    it('returns 404 when product is not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 when variant is not found', async () => {
      productRepo.findOne.mockResolvedValue(makeProduct());
      variantRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/products/${PRODUCT_ID}/variants/${VARIANT_ID}`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /products/:productId/variants/generate-matrix ──────────────────

  describe('POST /products/:productId/variants/generate-matrix', () => {
    it('returns 201 with generated variants array', async () => {
      const value1 = makeAttributeValue({
        id: VALUE_ID_1,
        attributeId: ATTR_ID,
        value: 'Red',
      });
      const value2 = makeAttributeValue({
        id: VALUE_ID_2,
        attributeId: ATTR_ID,
        value: 'Blue',
      });
      const variant1 = makeVariant({
        id: VARIANT_ID,
        sku: `${PRODUCT_ID.slice(0, 8)}-abc123`,
      });
      const variant2 = makeVariant({
        id: 'ffffffff-0000-1111-2222-333333333333',
        sku: `${PRODUCT_ID.slice(0, 8)}-def456`,
      });

      productRepo.findOne.mockResolvedValue(makeProduct());
      // find values for the attribute
      attributeValueRepo.find.mockResolvedValueOnce([value1, value2]);
      // no existing variant for first combo
      variantRepo.findByCombinationHash.mockResolvedValueOnce(null);
      variantRepo.createWithAttributes.mockResolvedValueOnce(variant1);
      // no existing variant for second combo
      variantRepo.findByCombinationHash.mockResolvedValueOnce(null);
      variantRepo.createWithAttributes.mockResolvedValueOnce(variant2);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants/generate-matrix`)
        .send({ attributeIds: [ATTR_ID] });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(2);
    });

    it('returns 201 and reuses existing non-deleted variants', async () => {
      const value1 = makeAttributeValue({
        id: VALUE_ID_1,
        attributeId: ATTR_ID,
      });
      const existingVariant = makeVariant({
        isDeleted: false,
        deletedAt: null,
      });

      productRepo.findOne.mockResolvedValue(makeProduct());
      attributeValueRepo.find.mockResolvedValueOnce([value1]);
      // existing variant found and not deleted — should be reused
      variantRepo.findByCombinationHash.mockResolvedValueOnce(existingVariant);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants/generate-matrix`)
        .send({ attributeIds: [ATTR_ID] });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(1);
      expect(variantRepo.createWithAttributes).not.toHaveBeenCalled();
    });

    it('returns 404 when product is not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants/generate-matrix`)
        .send({ attributeIds: [ATTR_ID] });

      expect(res.status).toBe(404);
    });

    it('returns 404 when attribute has no values', async () => {
      productRepo.findOne.mockResolvedValue(makeProduct());
      // empty values list for the attribute
      attributeValueRepo.find.mockResolvedValueOnce([]);

      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants/generate-matrix`)
        .send({ attributeIds: [ATTR_ID] });

      expect(res.status).toBe(404);
    });

    it('returns 400 when attributeIds is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants/generate-matrix`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 when attributeIds is an empty array', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${PRODUCT_ID}/variants/generate-matrix`)
        .send({ attributeIds: [] });

      expect(res.status).toBe(400);
    });
  });
});
