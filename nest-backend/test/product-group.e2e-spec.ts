import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProductGroupModule } from '../src/modules/product-group/product-group.module';
import { ProductGroup } from '../src/modules/product-group/entities/product-group.entity';
import { GroupField } from '../src/modules/product-group/entities/group-field.entity';
import { GroupFieldOption } from '../src/modules/product-group/entities/group-field-option.entity';
import { ProductGroupFieldValue } from '../src/modules/product/entities/product-group-field-value.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── helpers ─────────────────────────────────────────────────────────────────
const GROUP_ID = 'd1b2c3d4-e5f6-7890-abcd-ef1234567880';

function makeGroup(overrides: Partial<ProductGroup> = {}): ProductGroup {
  return {
    id: GROUP_ID,
    name: 'Clothing',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    fields: [],
    ...overrides,
  };
}

// ─── test suite ──────────────────────────────────────────────────────────────
describe('ProductGroupController (e2e)', () => {
  let app: INestApplication;

  let productGroupRepo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    delete: jest.Mock;
  };
  let groupFieldRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  let groupFieldOptionRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };

  beforeAll(async () => {
    productGroupRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      delete: jest.fn(),
    };
    groupFieldRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };
    groupFieldOptionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductGroupModule],
      providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseTransformer }],
    })
      .overrideProvider(getRepositoryToken(ProductGroup))
      .useValue(productGroupRepo)
      .overrideProvider(getRepositoryToken(GroupField))
      .useValue(groupFieldRepo)
      .overrideProvider(getRepositoryToken(GroupFieldOption))
      .useValue(groupFieldOptionRepo)
      .overrideProvider(getRepositoryToken(ProductGroupFieldValue))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      })
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

  // ─── GET /product-groups ────────────────────────────────────────────────────
  describe('GET /product-groups', () => {
    it('returns 200 with paginated result shape', async () => {
      const group = makeGroup();
      productGroupRepo.findAndCount.mockResolvedValue([[group], 1]);

      const res = await request(app.getHttpServer())
        .get('/product-groups')
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
        id: GROUP_ID,
        name: 'Clothing',
      });
    });

    it('returns 200 with empty list when no groups exist', async () => {
      productGroupRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/product-groups')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
    });
  });

  // ─── GET /product-groups/:id ────────────────────────────────────────────────
  describe('GET /product-groups/:id', () => {
    it('returns 200 with the group when it exists', async () => {
      const group = makeGroup();
      productGroupRepo.findOne.mockResolvedValue(group);

      const res = await request(app.getHttpServer()).get(
        `/product-groups/${GROUP_ID}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: GROUP_ID, name: 'Clothing' });
    });

    it('returns 404 when the group does not exist', async () => {
      productGroupRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/product-groups/${GROUP_ID}`,
      );

      expect(res.status).toBe(404);
    });

    it('returns 400 for a non-UUID id parameter', async () => {
      const res = await request(app.getHttpServer()).get(
        '/product-groups/not-a-uuid',
      );

      expect(res.status).toBe(400);
    });
  });

  // ─── GET /product-groups/:id/fields ─────────────────────────────────────────
  describe('GET /product-groups/:id/fields', () => {
    it('returns 200 with the group including its fields', async () => {
      const group = makeGroup({
        fields: [
          {
            id: 'f1b2c3d4-e5f6-7890-abcd-ef1234567881',
            fieldName: 'Color',
            fieldKey: 'color',
            fieldType: 'text' as any,
            isRequired: false,
            isFilterable: false,
            sortOrder: 0,
            options: [],
            group: null as any,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            deletedAt: null,
            groupId: GROUP_ID,
          },
        ],
      });
      // findWithFields uses a separate findOne call with relations
      productGroupRepo.findOne.mockResolvedValue(group);

      const res = await request(app.getHttpServer()).get(
        `/product-groups/${GROUP_ID}/fields`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: GROUP_ID });
    });

    it('returns 404 when the group does not exist', async () => {
      productGroupRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(
        `/product-groups/${GROUP_ID}/fields`,
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /product-groups ────────────────────────────────────────────────────
  describe('POST /product-groups', () => {
    it('returns 201 with the created group when dto is valid', async () => {
      const dto = { name: 'Electronics' };
      const created = makeGroup({ name: 'Electronics' });

      // findByName (duplicate check) → null = no conflict
      productGroupRepo.findOne.mockResolvedValueOnce(null);
      productGroupRepo.create.mockReturnValue(created);
      productGroupRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/product-groups')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ name: 'Electronics' });
    });

    it('returns 400 when the required "name" field is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/product-groups')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 409 when a group with the same name already exists', async () => {
      const dto = { name: 'Clothing' };
      const existing = makeGroup({ name: 'Clothing' });

      // findByName → existing group signals a conflict
      productGroupRepo.findOne.mockResolvedValueOnce(existing);

      const res = await request(app.getHttpServer())
        .post('/product-groups')
        .send(dto);

      expect(res.status).toBe(409);
    });

    it('returns 201 with nested fields when fields are provided in the dto', async () => {
      const dto = {
        name: 'Footwear',
        fields: [
          {
            fieldName: 'Size',
            fieldType: 'text',
            isRequired: true,
            sortOrder: 1,
          },
        ],
      };
      const created = makeGroup({
        name: 'Footwear',
        fields: [
          {
            id: 'f2b2c3d4-e5f6-7890-abcd-ef1234567882',
            fieldName: 'Size',
            fieldKey: 'size',
            fieldType: 'text' as any,
            isRequired: true,
            isFilterable: false,
            sortOrder: 1,
            options: [],
            group: null as any,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            deletedAt: null,
            groupId: GROUP_ID,
          },
        ],
      });

      productGroupRepo.findOne.mockResolvedValueOnce(null);
      productGroupRepo.create.mockReturnValue(created);
      productGroupRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/product-groups')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ name: 'Footwear' });
    });
  });

  // ─── PATCH /product-groups/:id ──────────────────────────────────────────────
  describe('PATCH /product-groups/:id', () => {
    it('returns 200 with the updated group', async () => {
      const updated = makeGroup({ name: 'Updated Clothing' });

      // findOne for existence check inside update
      productGroupRepo.findOne.mockResolvedValueOnce(updated);
      // findByName check (no conflict with another group)
      productGroupRepo.findOne.mockResolvedValueOnce(null);
      productGroupRepo.update.mockResolvedValue({ affected: 1 });
      // findById after update
      productGroupRepo.findOne.mockResolvedValueOnce(updated);

      const res = await request(app.getHttpServer())
        .patch(`/product-groups/${GROUP_ID}`)
        .send({ name: 'Updated Clothing' });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: GROUP_ID,
        name: 'Updated Clothing',
      });
    });

    it('returns 404 when the group to update does not exist', async () => {
      productGroupRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch(`/product-groups/${GROUP_ID}`)
        .send({ name: 'Ghost Group' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /product-groups/:id ─────────────────────────────────────────────
  describe('DELETE /product-groups/:id', () => {
    it('returns 204 when the group is deleted successfully', async () => {
      const group = makeGroup();
      productGroupRepo.findOne.mockResolvedValue(group);
      productGroupRepo.softDelete.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer()).delete(
        `/product-groups/${GROUP_ID}`,
      );

      expect(res.status).toBe(204);
    });

    it('returns 404 when the group to delete does not exist', async () => {
      productGroupRepo.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete(
        `/product-groups/${GROUP_ID}`,
      );

      expect(res.status).toBe(404);
    });
  });
});
