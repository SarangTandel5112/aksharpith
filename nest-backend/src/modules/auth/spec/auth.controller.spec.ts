import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SignUpDto } from '../dto/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('delegates to AuthService.signUp and returns result', async () => {
      const dto: SignUpDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      mockAuthService.signUp.mockResolvedValue({
        message: 'User registered successfully',
      });

      const result = await controller.signUp(dto);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('signIn', () => {
    it('sets HttpOnly access_token cookie and returns success message', async () => {
      const user = { id: 'uuid-1', email: 'john@example.com' } as any;
      mockAuthService.signIn.mockResolvedValue({ accessToken: 'jwt-token' });

      const result = await controller.signIn({} as any, user, mockRes as any);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(user);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(result).toEqual({ message: 'Login successful' });
    });
  });

  describe('logout', () => {
    it('clears the access_token cookie and returns success message', () => {
      const result = controller.logout(mockRes as any);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('access_token', {
        path: '/',
      });
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});
