import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../modules/user/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ jwtSecret: 'test-secret' }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
    jest.clearAllMocks();
  });

  it('returns the user when the account is active', async () => {
    const user = {
      id: 'user-1',
      email: 'active@example.com',
      isActive: true,
      role: { roleName: 'Admin' },
    } as User;
    mockUserRepository.findOne.mockResolvedValue(user);

    await expect(
      strategy.validate({ id: user.id, email: user.email }),
    ).resolves.toBe(user);
  });

  it('rejects inactive users', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: 'user-2',
      email: 'inactive@example.com',
      isActive: false,
    } as User);

    await expect(
      strategy.validate({ id: 'user-2', email: 'inactive@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
