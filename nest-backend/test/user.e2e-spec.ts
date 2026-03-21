/**
 * E2E tests for the User module (GET/POST/PATCH/DELETE /users).
 *
 * Strategy:
 *  - Spin up UserModule with all TypeORM repositories replaced by jest mocks.
 *  - JwtModule is registered with a hard-coded secret so we can sign test
 *    tokens ourselves without a real database or env file.
 *  - JwtAuthGuard and RolesGuard are overridden at the guard level.  The test
 *    JwtAuthGuard decodes the Bearer token without touching any database; when
 *    no token is present it throws UnauthorizedException (401).  The test
 *    RolesGuard always returns true.
 *  - ResponseTransformer is registered as a global interceptor on the test app
 *    so response envelopes match production behaviour ({ statusCode, message, data }).
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../src/modules/user/user.module';
import { User } from '../src/modules/user/entities/user.entity';
import { Role } from '../src/modules/role/entities/role.entity';
import { JwtAuthGuard } from '../src/security/jwt-auth.guard';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';

// ─── Constants ───────────────────────────────────────────────────────────────

const TEST_JWT_SECRET = 'e2e-test-secret-key';
const TEST_USER_ID = 'a1b2c3d4-e5f6-4000-8000-aabbccddeeff';
const TEST_ROLE_ID = 'f1e2d3c4-b5a6-4000-8000-112233445566';
const TEST_EMAIL = 'admin@example.com';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRole(overrides: Partial<Role> = {}): Role {
  return {
    id: TEST_ROLE_ID,
    roleName: 'Admin',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  } as Role;
}

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: TEST_USER_ID,
    firstName: 'Alice',
    middleName: null,
    lastName: 'Smith',
    email: TEST_EMAIL,
    password: '$2b$10$hashedvalue',
    roleId: TEST_ROLE_ID,
    role: buildRole(),
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  } as User;
}

// ─── Guard overrides ──────────────────────────────────────────────────────────

/**
 * Replaces JwtAuthGuard entirely – no passport or JwtStrategy wiring needed.
 * Decodes the Bearer token with a raw JwtService instance.  Throws
 * UnauthorizedException when the header is absent or the token is invalid
 * so that endpoints return 401 (not 403).
 */
@Injectable()
class TestJwtAuthGuard implements CanActivate {
  private readonly jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService({ secret: TEST_JWT_SECRET });
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const [, token] = authHeader.split(' ');
    try {
      req.user = this.jwtService.verify(token);
      req.user.role = buildRole();
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

/** Replaces RolesGuard – always grants access so role setup is irrelevant. */
@Injectable()
class AlwaysAllowRolesGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

// ─── Mock repository factories ────────────────────────────────────────────────

function buildMockUserRepo() {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

function buildMockRoleRepo() {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Users (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let mockUserRepo: ReturnType<typeof buildMockUserRepo>;
  let mockRoleRepo: ReturnType<typeof buildMockRoleRepo>;

  beforeEach(async () => {
    mockUserRepo = buildMockUserRepo();
    mockRoleRepo = buildMockRoleRepo();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepo)
      .overrideProvider(getRepositoryToken(Role))
      .useValue(mockRoleRepo)
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(AlwaysAllowRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new ResponseTransformer());
    await app.init();

    jwtService = moduleFixture.get(JwtService);
    authToken = jwtService.sign({
      sub: TEST_USER_ID,
      email: TEST_EMAIL,
      id: TEST_USER_ID,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── GET /users ──────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('returns 401 when no Authorization header is provided', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('returns 200 with a paginated envelope when a valid JWT is provided', async () => {
      const users = [buildUser()];
      mockUserRepo.findAndCount.mockResolvedValue([users, 1]);

      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // ResponseTransformer wraps the result in { statusCode, message, data }
      const body = res.body;
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('items');
      expect(body.data).toHaveProperty('total', 1);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0]).toMatchObject({ email: TEST_EMAIL });
    });

    it('returns an empty items array when no users exist', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
    });

    it('respects pagination query parameters', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      await request(app.getHttpServer())
        .get('/users?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // UserRepository.findAll passes skip=(page-1)*limit and take=limit to findAndCount
      const callArgs = mockUserRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.skip).toBe(5);
      expect(callArgs.take).toBe(5);
    });
  });

  // ─── GET /users/:id ──────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('returns 200 and the user object when the user exists', async () => {
      const user = buildUser();
      mockUserRepo.findOne.mockResolvedValue(user);

      const res = await request(app.getHttpServer())
        .get(`/users/${TEST_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
      });
    });

    it('returns 404 when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/users/${TEST_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/users/not-a-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('returns 401 when no token is supplied', async () => {
      await request(app.getHttpServer())
        .get(`/users/${TEST_USER_ID}`)
        .expect(401);
    });
  });

  // ─── POST /users ─────────────────────────────────────────────────────────

  describe('POST /users', () => {
    const validPayload = {
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob.jones@example.com',
      password: 'MySecret99!',
      roleId: TEST_ROLE_ID,
    };

    it('returns 201 and the created user when payload is valid', async () => {
      // findByEmail → null (no duplicate)
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      const created = buildUser({
        email: validPayload.email,
        firstName: 'Bob',
        lastName: 'Jones',
      });
      mockUserRepo.create.mockReturnValue(created);
      mockUserRepo.save.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayload)
        .expect(201);

      expect(res.body.data).toMatchObject({ email: validPayload.email });
    });

    it('returns 409 when the email is already in use', async () => {
      // findByEmail → returns existing user (triggers ConflictException in service)
      mockUserRepo.findOne.mockResolvedValue(
        buildUser({ email: validPayload.email }),
      );

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayload)
        .expect(409);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'only@email.com' })
        .expect(400);
    });

    it('returns 400 when the email is malformed', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, email: 'bad-email' })
        .expect(400);
    });

    it('returns 400 when password is shorter than 8 characters', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, password: 'short' })
        .expect(400);
    });

    it('returns 401 when no token is supplied', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(validPayload)
        .expect(401);
    });
  });

  // ─── PATCH /users/:id ────────────────────────────────────────────────────

  describe('PATCH /users/:id', () => {
    it('returns 200 and the updated user when the user exists', async () => {
      const existing = buildUser();
      const updated = buildUser({ firstName: 'UpdatedName' });

      // UserService.update calls findById (existence check) then update then findById again
      mockUserRepo.findOne
        .mockResolvedValueOnce(existing) // existence check in UserService.update
        .mockResolvedValueOnce(updated); // post-update fetch in UserRepository.update → findById
      mockUserRepo.update.mockResolvedValue({ affected: 1 });

      const res = await request(app.getHttpServer())
        .patch(`/users/${TEST_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'UpdatedName' })
        .expect(200);

      expect(res.body.data).toMatchObject({ firstName: 'UpdatedName' });
    });

    it('returns 404 when the user to update does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch(`/users/${TEST_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Ghost' })
        .expect(404);
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/users/not-a-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Test' })
        .expect(400);
    });

    it('returns 401 when no token is supplied', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${TEST_USER_ID}`)
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  // ─── DELETE /users/:id ───────────────────────────────────────────────────

  describe('DELETE /users/:id', () => {
    it('returns 204 when the user exists and is successfully soft-deleted', async () => {
      const existing = buildUser();
      mockUserRepo.findOne.mockResolvedValue(existing);
      mockUserRepo.softDelete.mockResolvedValue({ affected: 1 });

      await request(app.getHttpServer())
        .delete(`/users/${TEST_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('returns 404 when the user to delete does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete(`/users/${TEST_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/users/not-a-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('returns 401 when no token is supplied', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${TEST_USER_ID}`)
        .expect(401);
    });
  });
});
