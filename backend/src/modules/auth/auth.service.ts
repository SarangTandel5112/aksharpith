import { IUserRepository } from '@modules/user/interfaces/user.repository.interface';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos';
import { User } from '@entities';
import { BcryptHelper } from '@helpers/bcrypt.helper';
import { TokenHelper } from '@helpers/token.helper';
import {
  removePasswordHash,
  validateEntityExists,
} from '@helpers/entity.helper';
import { AuthResponse } from './interfaces/auth.service.interface';

/**
 * Auth Service
 * Uses entity helpers to reduce code duplication
 * Implements authentication and authorization logic
 */
export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await BcryptHelper.hash(registerDto.password);

    const user = await this.userRepository.create({
      username: registerDto.username,
      Firstname: registerDto.Firstname,
      Middlename: registerDto.Middlename,
      Lastname: registerDto.Lastname,
      email: registerDto.email,
      passwordHash: hashedPassword,
      isTempPassword: false,
    });

    const token = TokenHelper.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = TokenHelper.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: removePasswordHash(user),
      token,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await BcryptHelper.compare(
      loginDto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = TokenHelper.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
    });

    const refreshToken = TokenHelper.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: removePasswordHash(user),
      token,
      refreshToken,
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const payload = TokenHelper.verifyRefreshToken(
        refreshTokenDto.refreshToken
      );

      const user = await this.userRepository.findById(payload.userId);
      validateEntityExists(user, 'User');

      const token = TokenHelper.generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
      });

      const newRefreshToken = TokenHelper.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      return {
        token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = TokenHelper.verifyToken(token);
      const user = await this.userRepository.findById(payload.userId);
      return user;
    } catch (error) {
      return null;
    }
  }
}
