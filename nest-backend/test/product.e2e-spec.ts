import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProductModule } from '../src/modules/product/product.module';
import { Product } from '../src/modules/product/entities/product.entity';
import { ProductMedia } from '../src/modules/product/entities/product-media.entity';
import { ProductPhysicalAttributes } from '../src/modules/product/entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from '../src/modules/product/entities/product-marketing-media.entity';
import { ProductZone } from '../src/modules/product/entities/product-zone.entity';
import { ProductVendor } from '../src/modules/product/entities/product-vendor.entity';
import { ProductGroupFieldValue } from '../src/modules/product/entities/product-group-field-value.entity';
import { GroupField } from '../src/modules/product-group/entities/group-field.entity';
import { GroupFieldOption } from '../src/modules/product-group/entities/group-field-option.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── helpers ─────────────────────────────────────────────────────────────────
const PRODUCT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const MEDIA_ID = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: PRODUCT_ID,
    name: 'Test Product',
    sku: 'SKU-001',
    description: null,
    productType: 'simple' as any,
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

function makePhysicalAttributes(): ProductPhysicalAttributes {
  return {
    id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567892',
    productId: PRODUCT_ID,
    weight: 1.5,
    length: 10.0,
    width: 5.0,
    height: 3.0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    product: null as any,
  };
}

// ─── mock repo factories ──────────────────────────────────────────────────────
function makeProductRepoMock() {
  return {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

function makeSimpleRepoMock() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };
}

// ─── test suite ──────────────────────────────────────────────────────────────
describe('ProductController (e2e)', () => {
  let app: INestApplication;

  let productRepo: ReturnType<typeof makeProductRepoMock>;
  let mediaRepo: ReturnType<typeof makeSimpleRepoMock>;
  let physRepo: ReturnType<typeof makeSimpleRepoMock>;
  let marketingMediaRepo: ReturnType<typeof makeSimpleRepoMock>;
  let zoneRepo: ReturnType<typeof makeSimpleRepoMock>;
  let vendorRepo: ReturnType<typeof makeSimpleRepoMock>;
  let groupFieldValueRepo: ReturnType<typeof makeSimpleRepoMock>;
  let groupFieldRepo: ReturnType<typeof makeSimpleRepoMock>;
  let groupFieldOptionRepo: ReturnType<typeof makeSimpleRepoMock>;

  beforeAll(async () => {
    productRepo = makeProductRepoMock();
    mediaRepo = makeSimpleRepoMock();
    physRepo = makeSimpleRepoMock();
    marketingMediaRepo = makeSimpleRepoMock();
    zoneRepo = makeSimpleRepoMock();
    vendorRepo = makeSimpleRepoMock();
    groupFieldValueRepo = makeSimpleRepoMock();
    groupFieldRepo = makeSimpleRepoMock();
    groupFieldOptionRepo = makeSimpleRepoMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductModule],
      providers: [
        { provide: APP_INTERCEPTOR, useClass: ResponseTransformer },
      ],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue(productRepo)
      .overrideProvider(getRepositoryToken(ProductMedia))
      .useValue(mediaRepo)
      .overrideProvider(getRepositoryToken(ProductPhysicalAttributes))
      .useValue(physRepo)
      .overrideProvider(getRepositoryToken(ProductMarketingMedia))
      .useValue(marketingMediaRepo)
      .overrideProvider(getRepositoryToken(ProductZone))
      .useValue(zoneRepo)
      .overrideProvider(getRepositoryToken(ProductVendor))
      .useValue(vendorRepo)
      .overrideProvider(getRepositoryToken(ProductGroupFieldValue))
      .useValue(groupFieldValueRepo)
      .overrideProvider(getRepositoryToken(GroupField))
      .useValue(groupFieldRepo)
      .overrideProvider(getRepositoryToken(GroupFieldOption))
      .useValue(groupFieldOptionRepo)
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

  // Reset all mock implementations before each test so they are independent.
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── GET /products ──────────────────────────────────────────────────────────
  describe('GET /products', () => {
    it('returns 200 with paginated result shape', async () => {
      const product = makeProduct();
      productRepo.findAndCount.mockResolvedValue([[product], 1]);

      const res = await request(app.getHttpServer())
        .get('/products')
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
        id: PRODUCT_ID,
        sku: 'SKU-001',
        name: 'Test Product',
      });
    });

    it('returns 200 with empty items when no products exist', async () => {
      productRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/products')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalPages).toBe(0);
    });
  });

  // ─── GET /products/stats/count ──────────────────────────────────────────────
  describe('GET /products/stats/count', () => {
    it('returns 200 with type-count record', async () => {
      const selectMock = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'simple', count: '5' },
          { type: 'variable', count: '2' },
        ]),
      };
      productRepo.createQueryBuilder.mockReturnValue(selectMock);

      const res = await request(app.getHttpServer()).get('/products/stats/count');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: { simple: 5, variable: 2 },
      });
    });
  });

  // ─── GET /products/:id ──────────────────────────────────────────────────────
  describe('GET /products/:id', () => {
    it('returns 200 with the product when it exists', async () => {
      const product = makeProduct();
      productRepo.findOne.mockResolvedValue(product);

      const res = await request(app.getHttpServer()).get(`/products/${PRODUCT_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: PRODUCT_ID, sku: 'SKU-001' });
    });

    it('returns 404 when product does not exist', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).get('/products/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });

  // ─── POST /products ─────────────────────────────────────────────────────────
  describe('POST /products', () => {
    it('returns 201 with the created product when dto is valid', async () => {
      const dto = { name: 'New Product', sku: 'SKU-NEW' };
      const created = makeProduct({ name: 'New Product', sku: 'SKU-NEW' });

      // findBySku (duplicate check) → null = no conflict
      productRepo.findOne.mockResolvedValueOnce(null);
      productRepo.create.mockReturnValue(created);
      productRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/products')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ sku: 'SKU-NEW', name: 'New Product' });
    });

    it('returns 400 when required field "name" is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ sku: 'SKU-ONLY' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when required field "sku" is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Name Only' });

      expect(res.status).toBe(400);
    });

    it('returns 409 when the SKU already exists', async () => {
      const dto = { name: 'Duplicate', sku: 'SKU-DUPE' };
      const existing = makeProduct({ sku: 'SKU-DUPE' });

      // findBySku → existing product signals a conflict
      productRepo.findOne.mockResolvedValueOnce(existing);

      const res = await request(app.getHttpServer())
        .post('/products')
        .send(dto);

      expect(res.status).toBe(409);
    });
  });

  // ─── PATCH /products/:id ────────────────────────────────────────────────────
  describe('PATCH /products/:id', () => {
    it('returns 200 with the updated product', async () => {
      const updated = makeProduct({ name: 'Updated Name' });

      // First findOne → used by findOne (exists check inside update)
      productRepo.findOne.mockResolvedValueOnce(updated);
      // update call (no return value needed)
      productRepo.update.mockResolvedValue({ affected: 1 });
      // Second findOne → used by findById after update
      productRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: PRODUCT_ID, name: 'Updated Name' });
    });

    it('returns 404 when the product to update does not exist', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}`)
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /products/:id ───────────────────────────────────────────────────
  describe('DELETE /products/:id', () => {
    it('returns 204 when the product is deleted successfully', async () => {
      const product = makeProduct();
      productRepo.findOne.mockResolvedValue(product);
      productRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(
        `/products/${PRODUCT_ID}`,
      );

      expect(res.status).toBe(204);
    });

    it('returns 404 when the product to delete does not exist', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/products/${PRODUCT_ID}`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── PUT /products/:id/physical-attributes ──────────────────────────────────
  describe('PUT /products/:id/physical-attributes', () => {
    it('returns 200 with the upserted physical attributes', async () => {
      const product = makeProduct();
      const attrs = makePhysicalAttributes();

      // findOne for product existence check
      productRepo.findOne.mockResolvedValue(product);
      // physRepo.findOne → no existing record (create path)
      physRepo.findOne.mockResolvedValue(null);
      physRepo.create.mockReturnValue(attrs);
      physRepo.save.mockResolvedValue(attrs);

      const res = await request(app.getHttpServer())
        .put(`/products/${PRODUCT_ID}/physical-attributes`)
        .send({ weight: 1.5, length: 10.0, width: 5.0, height: 3.0 });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ productId: PRODUCT_ID });
    });

    it('returns 404 when the product does not exist', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .put(`/products/${PRODUCT_ID}/physical-attributes`)
        .send({ weight: 1.0 });

      expect(res.status).toBe(404);
    });
  });

  // ─── GET /products/:id/physical-attributes ──────────────────────────────────
  describe('GET /products/:id/physical-attributes', () => {
    it('returns 200 with the physical attributes when they exist', async () => {
      const product = makeProduct();
      const attrs = makePhysicalAttributes();

      productRepo.findOne.mockResolvedValue(product);
      physRepo.findOne.mockResolvedValue(attrs);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/physical-attributes`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ productId: PRODUCT_ID });
    });

    it('returns 200 with null data when no physical attributes are set', async () => {
      const product = makeProduct();

      productRepo.findOne.mockResolvedValue(product);
      physRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/physical-attributes`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });

    it('returns 404 when the product does not exist', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/products/${PRODUCT_ID}/physical-attributes`,
      );

      expect(res.status).toBe(404);
    });
  });
});
