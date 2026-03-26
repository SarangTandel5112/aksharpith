import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Modules
import { ProductModule } from '../src/modules/product/product.module';
import { ProductVariantModule } from '../src/modules/product-variant/product-variant.module';
import { ProductGroupModule } from '../src/modules/product-group/product-group.module';
import { ProductAttributeModule } from '../src/modules/product-attribute/product-attribute.module';

// Product entities
import { Product } from '../src/modules/product/entities/product.entity';
import { ProductMedia } from '../src/modules/product/entities/product-media.entity';
import { ProductPhysicalAttributes } from '../src/modules/product/entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from '../src/modules/product/entities/product-marketing-media.entity';
import { ProductZone } from '../src/modules/product/entities/product-zone.entity';
import { ProductVendor } from '../src/modules/product/entities/product-vendor.entity';
import { ProductGroupFieldValue } from '../src/modules/product/entities/product-group-field-value.entity';
import { GroupField } from '../src/modules/product-group/entities/group-field.entity';
import { GroupFieldOption } from '../src/modules/product-group/entities/group-field-option.entity';

// ProductVariant entities
import { ProductVariant } from '../src/modules/product-variant/entities/product-variant.entity';
import { ProductVariantAttribute } from '../src/modules/product-variant/entities/product-variant-attribute.entity';
import { ProductVariantMedia } from '../src/modules/product-variant/entities/product-variant-media.entity';
import { ProductAttributeValue } from '../src/modules/product-attribute/entities/product-attribute-value.entity';

// ProductGroup entities
import { ProductGroup } from '../src/modules/product-group/entities/product-group.entity';

// ProductAttribute entities
import { ProductAttribute } from '../src/modules/product-attribute/entities/product-attribute.entity';

// Guards and interceptors
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';
import { initE2eApp } from './helpers/init-e2e-app';

// ─── constants ───────────────────────────────────────────────────────────────
const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// ─── mock repo factory ────────────────────────────────────────────────────────
function makeRepoMock() {
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

// ─── app builder ─────────────────────────────────────────────────────────────
async function buildApp(
  moduleClass: any,
  repoOverrides: Array<{ token: any; mock: object }>,
): Promise<INestApplication> {
  let builder = Test.createTestingModule({
    imports: [moduleClass],
    providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
  });

  for (const { token, mock } of repoOverrides) {
    builder = builder.overrideProvider(getRepositoryToken(token)).useValue(mock);
  }

  const moduleFixture: TestingModule = await builder
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await initE2eApp(app);
  return app;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Input Validation (e2e)', () => {
  // ── POST /products ─────────────────────────────────────────────────────────
  describe('POST /products', () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await buildApp(ProductModule, [
        { token: Product, mock: makeRepoMock() },
        { token: ProductMedia, mock: makeRepoMock() },
        { token: ProductPhysicalAttributes, mock: makeRepoMock() },
        { token: ProductMarketingMedia, mock: makeRepoMock() },
        { token: ProductZone, mock: makeRepoMock() },
        { token: ProductVendor, mock: makeRepoMock() },
        { token: ProductGroupFieldValue, mock: makeRepoMock() },
        { token: GroupField, mock: makeRepoMock() },
        { token: GroupFieldOption, mock: makeRepoMock() },
      ]);
    });

    afterEach(async () => {
      await app.close();
    });

    it('returns 400 when "name" is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ sku: 'SKU-001' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "sku" is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'My Product' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "basePrice" is negative', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'My Product', sku: 'SKU-001', basePrice: -1 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "stockQuantity" is negative', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'My Product', sku: 'SKU-001', stockQuantity: -5 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "productType" is an invalid enum value', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'My Product', sku: 'SKU-001', productType: 'banana' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "departmentId" is not a valid UUID', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'My Product', sku: 'SKU-001', departmentId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });
  });

  // ── PUT /products/:id/physical-attributes ──────────────────────────────────
  describe('PUT /products/:id/physical-attributes', () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await buildApp(ProductModule, [
        { token: Product, mock: makeRepoMock() },
        { token: ProductMedia, mock: makeRepoMock() },
        { token: ProductPhysicalAttributes, mock: makeRepoMock() },
        { token: ProductMarketingMedia, mock: makeRepoMock() },
        { token: ProductZone, mock: makeRepoMock() },
        { token: ProductVendor, mock: makeRepoMock() },
        { token: ProductGroupFieldValue, mock: makeRepoMock() },
        { token: GroupField, mock: makeRepoMock() },
        { token: GroupFieldOption, mock: makeRepoMock() },
      ]);
    });

    afterEach(async () => {
      await app.close();
    });

    it('returns 400 when "weight" is negative', async () => {
      const res = await request(app.getHttpServer())
        .put(`/products/${VALID_UUID}/physical-attributes`)
        .send({ weight: -1 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "length" is negative', async () => {
      const res = await request(app.getHttpServer())
        .put(`/products/${VALID_UUID}/physical-attributes`)
        .send({ length: -5 });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /products/:productId/variants ────────────────────────────────────
  describe('POST /products/:productId/variants', () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await buildApp(ProductVariantModule, [
        { token: ProductVariant, mock: makeRepoMock() },
        { token: ProductVariantAttribute, mock: makeRepoMock() },
        { token: ProductVariantMedia, mock: makeRepoMock() },
        { token: Product, mock: makeRepoMock() },
        { token: ProductAttributeValue, mock: makeRepoMock() },
      ]);
    });

    afterEach(async () => {
      await app.close();
    });

    it('returns 400 when "price" is negative', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${VALID_UUID}/variants`)
        .send({
          sku: 'VAR-001',
          price: -10,
          attributeValueIds: [VALID_UUID],
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 when "attributeValueIds" is not an array', async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${VALID_UUID}/variants`)
        .send({
          sku: 'VAR-001',
          price: 10,
          attributeValueIds: 'not-an-array',
        });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /product-groups ──────────────────────────────────────────────────
  describe('POST /product-groups', () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await buildApp(ProductGroupModule, [
        { token: ProductGroup, mock: makeRepoMock() },
        { token: GroupField, mock: makeRepoMock() },
        { token: GroupFieldOption, mock: makeRepoMock() },
        { token: ProductGroupFieldValue, mock: makeRepoMock() },
      ]);
    });

    afterEach(async () => {
      await app.close();
    });

    it('returns 400 when "name" is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/product-groups')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 when "name" is an empty string', async () => {
      const res = await request(app.getHttpServer())
        .post('/product-groups')
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /product-attributes ──────────────────────────────────────────────
  describe('POST /product-attributes', () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await buildApp(ProductAttributeModule, [
        { token: ProductAttribute, mock: makeRepoMock() },
        { token: ProductAttributeValue, mock: makeRepoMock() },
      ]);
    });

    afterEach(async () => {
      await app.close();
    });

    it('returns 400 when "name" is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/product-attributes')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
