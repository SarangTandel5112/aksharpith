/**
 * E2E tests for the Auth module (POST /auth/registration, POST /auth/login).
 *
 * Strategy:
 *  - Spin up AuthModule with all TypeORM repositories replaced by jest mocks.
 *  - ConfigService is overridden to return a hard-coded JWT secret so that
 *    JwtModule and JwtStrategy can operate without a real database or env file.
 *  - The bcrypt hash is computed once in beforeAll so that the LocalStrategy's
 *    compareSync check passes for the happy-path login test.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AuthModule } from '../src/modules/auth/auth.module';
import { User } from '../src/modules/user/entities/user.entity';
import { PasswordResetToken } from '../src/modules/auth/entities/password-reset-token.entity';
import { ResponseTransformer } from '../src/core/interceptors/response.transformer';
import { initE2eApp } from './helpers/init-e2e-app';

// ─── Shared test fixtures ────────────────────────────────────────────────────

const TEST_JWT_SECRET = 'e2e-test-secret-key';
const TEST_USER_ID = 'aabbccdd-0000-0000-0000-aabbccddeeff';
const TEST_EMAIL = 'alice@example.com';
const TEST_PASSWORD = 'Passw0rd!';

// Hashed once for the entire suite to avoid slow repeated hashing.
let hashedPassword: string;

// ─── Mock factories ──────────────────────────────────────────────────────────

/**
 * Build the mock for the TypeORM User repository used directly by AuthService
 * and by JwtStrategy.  Each test overrides individual method implementations
 * via `mockResolvedValue` / `mockReturnValue` where needed.
 */
function buildMockUserRepo() {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

/** PasswordResetToken repository – not exercised by any auth tests but must
 *  be provided so that TypeOrmModule.forFeature([User, PasswordResetToken])
 *  can resolve its token. */
function buildMockPasswordResetTokenRepo() {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
}

/**
 * ConfigService mock – returns a stable JWT secret and expiry so that
 * JwtModule.registerAsync and JwtStrategy both work without real env vars.
 */
function buildMockConfigService() {
  return {
    get: jest.fn((key: string, defaultVal?: unknown) => {
      if (key === 'authkey') {
        return { jwtSecret: TEST_JWT_SECRET, expiresIn: '1h' };
      }
      if (key === 'JWT_EXPIRES_IN') return defaultVal ?? '1h';
      return defaultVal ?? undefined;
    }),
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mockUserRepo: ReturnType<typeof buildMockUserRepo>;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  });

  beforeEach(async () => {
    mockUserRepo = buildMockUserRepo();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepo)
      .overrideProvider(getRepositoryToken(PasswordResetToken))
      .useValue(buildMockPasswordResetTokenRepo())
      .overrideProvider(ConfigService)
      .useValue(buildMockConfigService())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new ResponseTransformer());
    await initE2eApp(app);
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /auth/registration ────────────────────────────────────────────

  describe('POST /auth/registration', () => {
    const validPayload = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'newuser@example.com',
      password: 'SecurePass1!',
    };

    it('returns 201 and a success message when registration data is valid', async () => {
      // No existing user with that email → allow creation
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({
        id: TEST_USER_ID,
        ...validPayload,
      });
      mockUserRepo.save.mockResolvedValue({
        id: TEST_USER_ID,
        ...validPayload,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/registration')
        .send(validPayload)
        .expect(201);

      // ResponseTransformer wraps the service return value in { statusCode, message, data }
      // AuthService.signUp returns { message: '...' } which lands in res.body.data
      expect(res.body.data).toMatchObject({
        message: 'User registered successfully',
      });
    });

    it('returns 400 when a required field (firstName) is missing', async () => {
      const { firstName: _omit, ...incomplete } = validPayload;

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send(incomplete)
        .expect(400);
    });

    it('returns 400 when the email field is not a valid email address', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({ ...validPayload, email: 'not-an-email' })
        .expect(400);
    });

    it('returns 400 when password is shorter than 8 characters', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({ ...validPayload, password: 'short' })
        .expect(400);
    });

    it('returns 409 when the email address is already registered', async () => {
      // Simulate an existing user being found
      mockUserRepo.findOne.mockResolvedValue({
        id: TEST_USER_ID,
        email: validPayload.email,
      });

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send(validPayload)
        .expect(409);
    });

    it('returns 400 when an empty body is sent', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({})
        .expect(400);
    });
  });

  // ─── POST /auth/login ───────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    const buildUserRecord = () => ({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      password: hashedPassword,
      firstName: 'Alice',
      middleName: null,
      lastName: 'Smith',
      roleId: 'role-uuid-0001',
      isActive: true,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    });

    it('returns 200 and sets access-token header on valid credentials', async () => {
      const userRecord = buildUserRecord();

      // UserRepository.findByEmail is the custom repository method that
      // AuthService.validateUser calls via the injected UserRepository.
      // UserRepository internally calls this.repo.findOne – we mock that.
      mockUserRepo.findOne.mockResolvedValue(userRecord);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      // Login now returns a message and sets an HttpOnly cookie
      expect(res.body.data).toMatchObject({ message: 'Login successful' });
      const setCookieHeader = res.headers['set-cookie'] as string[] | string;
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader ?? ''];
      expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(
        true,
      );
      expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);
    });

    it('returns 401 when the user account is inactive (isActive: false)', async () => {
      const inactiveUser = buildUserRecord();
      inactiveUser.isActive = false;
      mockUserRepo.findOne.mockResolvedValue(inactiveUser);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(401);
    });

    it('returns 401 when the password is wrong', async () => {
      const userRecord = buildUserRecord();
      mockUserRepo.findOne.mockResolvedValue(userRecord);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword99!' })
        .expect(401);
    });

    it('returns 401 when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@example.com', password: TEST_PASSWORD })
        .expect(401);
    });

    it('returns 401 when the email field is missing from the login body', async () => {
      // LocalAuthGuard invokes the passport-local strategy before the
      // ValidationPipe runs, so a missing credential → failed validation →
      // UnauthorizedException (401) rather than a DTO validation error (400).
      mockUserRepo.findOne.mockResolvedValue(null);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: TEST_PASSWORD })
        .expect(401);
    });

    it('returns 401 when the password field is missing from the login body', async () => {
      // Same reason as above: LocalAuthGuard runs before ValidationPipe.
      mockUserRepo.findOne.mockResolvedValue(null);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL })
        .expect(401);
    });
  });

  // ─── POST /auth/logout ──────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('returns 200 and clears the access_token cookie', async () => {
      const userRecord = {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        password: hashedPassword,
        firstName: 'Alice',
        middleName: null,
        lastName: 'Smith',
        roleId: 'role-uuid-0001',
        isActive: true,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      };

      mockUserRepo.findOne
        .mockResolvedValueOnce(userRecord)
        .mockResolvedValueOnce(userRecord);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      const authCookies = loginRes.headers['set-cookie'] as string[] | string;
      const authCookieString = Array.isArray(authCookies)
        ? authCookies.join('; ')
        : authCookies ?? '';
      const accessToken =
        authCookieString.match(/access_token=([^;]+)/)?.[1];

      expect(accessToken).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({ message: 'Logout successful' });
      const setCookieHeader = res.headers['set-cookie'] as string[] | string;
      const clearedCookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader ?? ''];
      // Cookie cleared = set with empty value or Max-Age=0
      expect(
        clearedCookies.some(
          (c: string) =>
            c.startsWith('access_token=;') ||
            c.includes('Max-Age=0') ||
            c.includes('Expires=Thu, 01 Jan 1970'),
        ),
      ).toBe(true);
    });
  });
});
