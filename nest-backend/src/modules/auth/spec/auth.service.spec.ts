import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';
import { UserRepository } from '../../user/user.repository';
import { SignUpDto } from '../dto/signup.dto';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'uuid-1',
    firstName: 'John',
    middleName: null,
    lastName: 'Doe',
    email: 'john@example.com',
    password: '$2b$10$hashedpassword',
    roleId: 'role-uuid-1',
    role: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as User);

describe('AuthService', () => {
  let service: AuthService;

  // TypeORM repository mock (for @InjectRepository(User))
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  // Custom UserRepository mock — matches the refactored repo interface
  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue({ jwtSecret: 'secret', expiresIn: '1h' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('signed-token');
    mockConfigService.get.mockReturnValue({ jwtSecret: 'secret', expiresIn: '1h' });
  });

  describe('signUp', () => {
    const dto: SignUpDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('creates user and returns success message', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const savedUser = makeUser();
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      const result = await service.signUp(dto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          middleName: null,
        }),
      );
      // Password must be hashed, not stored in plain text
      const createCall = mockUserRepo.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(dto.password);
      const hashValid = await bcrypt.compare(dto.password, createCall.password);
      expect(hashValid).toBe(true);

      expect(mockUserRepo.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('sets optional middleName and roleId when provided', async () => {
      const dtoWithOptionals: SignUpDto = {
        ...dto,
        middleName: 'Robert',
        roleId: 'role-uuid-1',
      };

      mockUserRepo.findOne.mockResolvedValue(null);
      const savedUser = makeUser({ middleName: 'Robert', roleId: 'role-uuid-1' });
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      await service.signUp(dtoWithOptionals);

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          middleName: 'Robert',
          roleId: 'role-uuid-1',
        }),
      );
    });

    it('throws ConflictException when email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUser());

      await expect(service.signUp(dto)).rejects.toThrow(ConflictException);
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException on unexpected DB save error', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(makeUser());
      mockUserRepo.save.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.signUp(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('signIn', () => {
    it('returns accessToken on valid user', async () => {
      const user = makeUser();
      mockJwtService.sign.mockReturnValue('jwt-access-token');

      const result = await service.signIn(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { email: user.email, id: user.id },
        expect.objectContaining({ expiresIn: expect.any(String) }),
      );
      expect(result).toEqual({ accessToken: 'jwt-access-token' });
    });

    it('throws InternalServerErrorException when jwt.sign throws', async () => {
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing error');
      });

      await expect(service.signIn(makeUser())).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateUser', () => {
    it('returns user on valid credentials', async () => {
      const plainPassword = 'password123';
      const hashed = await bcrypt.hash(plainPassword, 10);
      const user = makeUser({ password: hashed });
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(user.email, plainPassword);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
    });

    it('returns null when password is incorrect', async () => {
      const user = makeUser({ password: await bcrypt.hash('correct-password', 10) });
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(user.email, 'wrong-password');

      expect(result).toBeNull();
    });

    it('returns null when user is not found (findByEmail returns null)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'password');

      expect(result).toBeNull();
    });

    it('returns null when repository throws', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('DB error'));

      const result = await service.validateUser('error@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});
