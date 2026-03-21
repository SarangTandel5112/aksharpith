import { User } from '@entities/user.entity';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dtos';

export type AuthResponse = {
  user: Omit<User, 'passwordHash'>;
  token: string;
  refreshToken: string;
};

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  refreshToken(dto: RefreshTokenDto): Promise<{ token: string; refreshToken: string }>;
}
