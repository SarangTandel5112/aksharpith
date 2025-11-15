import { UserRepository } from '@modules/user/user.repository';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos';
import { User } from '@entities';
import { BcryptHelper } from '@helpers/bcrypt.helper';
import { TokenHelper } from '@helpers/token.helper';
import logger from '@setup/logger';

interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await BcryptHelper.hash(registerDto.password);

    // Create user
    const user = await this.userRepository.create({
      username: registerDto.username,
      Firstname: registerDto.Firstname,
      Middlename: registerDto.Middlename,
      Lastname: registerDto.Lastname,
      email: registerDto.email,
      passwordHash: hashedPassword,
      isTempPassword: false,
    });

    // Generate JWT tokens
    const token = TokenHelper.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = TokenHelper.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User registered successfully: ${user.email}`);

    // Return user without passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email with role relation
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await BcryptHelper.compare(
      loginDto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT tokens
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

    logger.info(`User logged in successfully: ${user.email}`);

    // Return user without passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = TokenHelper.verifyRefreshToken(
        refreshTokenDto.refreshToken
      );

      // Find user to ensure they still exist
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
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

      logger.info(`Token refreshed for user: ${user.email}`);

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
