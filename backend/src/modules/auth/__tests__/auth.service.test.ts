import { AuthService } from '../auth.service';
import { FakeUserRepository } from '@modules/user/__tests__/fakes/fake-user.repository';

jest.mock('@helpers/bcrypt.helper', () => ({
  BcryptHelper: {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@helpers/token.helper', () => ({
  TokenHelper: {
    generateToken: jest.fn().mockReturnValue('fake-token'),
    generateRefreshToken: jest.fn().mockReturnValue('fake-refresh-token'),
    verifyRefreshToken: jest.fn().mockReturnValue({ userId: 1, email: 'test@test.com' }),
    verifyToken: jest.fn().mockReturnValue({ userId: 1, email: 'test@test.com' }),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let repo: FakeUserRepository;

  beforeEach(() => {
    repo = new FakeUserRepository();
    service = new AuthService(repo);
    jest.clearAllMocks();

    // Re-apply mocks after clearAllMocks
    const { BcryptHelper } = jest.requireMock('@helpers/bcrypt.helper');
    BcryptHelper.hash.mockResolvedValue('hashed_password');
    BcryptHelper.compare.mockResolvedValue(true);

    const { TokenHelper } = jest.requireMock('@helpers/token.helper');
    TokenHelper.generateToken.mockReturnValue('fake-token');
    TokenHelper.generateRefreshToken.mockReturnValue('fake-refresh-token');
    TokenHelper.verifyRefreshToken.mockReturnValue({ userId: 1, email: 'test@test.com' });
    TokenHelper.verifyToken.mockReturnValue({ userId: 1, email: 'test@test.com' });
  });

  describe('register', () => {
    it('creates a new user and returns auth response', async () => {
      const result = await service.register({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        password: 'Password1!',
      });

      expect(result.token).toBe('fake-token');
      expect(result.refreshToken).toBe('fake-refresh-token');
      expect(result.user.email).toBe('alice@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws when email already exists', async () => {
      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed_password',
      });

      await expect(
        service.register({
          username: 'alice2',
          Firstname: 'Alice',
          Lastname: 'Smith',
          email: 'alice@example.com',
          password: 'Password1!',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed_password',
      });

      const result = await service.login({
        email: 'alice@example.com',
        password: 'Password1!',
      });

      expect(result.token).toBe('fake-token');
      expect(result.refreshToken).toBe('fake-refresh-token');
      expect(result.user.email).toBe('alice@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws when user not found', async () => {
      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'Password1!' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws when password is wrong', async () => {
      const { BcryptHelper } = jest.requireMock('@helpers/bcrypt.helper');
      BcryptHelper.compare.mockResolvedValue(false);

      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed_password',
      });

      await expect(
        service.login({ email: 'alice@example.com', password: 'WrongPass1!' })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    it('returns new tokens when refresh token is valid', async () => {
      // verifyRefreshToken returns { userId: 1 }, so seed a user with id 1
      await repo.create({
        username: 'alice',
        Firstname: 'Alice',
        Lastname: 'Smith',
        email: 'alice@example.com',
        passwordHash: 'hashed_password',
      });

      const result = await service.refreshToken({ refreshToken: 'valid-refresh-token' });

      expect(result.token).toBe('fake-token');
      expect(result.refreshToken).toBe('fake-refresh-token');
    });

    it('throws when refresh token is invalid', async () => {
      const { TokenHelper } = jest.requireMock('@helpers/token.helper');
      TokenHelper.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid or expired refresh token');
      });

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });
});
