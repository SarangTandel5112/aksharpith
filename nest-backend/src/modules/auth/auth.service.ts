import {
  Injectable,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { AuthKeyConfig, AuthKeyConfigName } from 'src/config/authkey.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    try {
      const {
        username,
        firstName,
        middleName,
        lastName,
        email,
        password,
        roleId,
      } =
        signUpDto;

      const emailExists = await this.userRepo.findOne({ where: { email } });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepo.create({
        username: username ?? email,
        firstName,
        middleName: middleName ?? null,
        lastName,
        email,
        password: hashedPassword,
        isTempPassword: false,
        ...(roleId ? { roleId } : {}),
      });

      await this.userRepo.save(user);
      return { message: 'User registered successfully' };
    } catch (error) {
      this.logger.error(`Signup failed: ${error.message}`, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async signIn(user: User): Promise<{ accessToken: string }> {
    try {
      const payload = { email: user.email, id: user.id };
      const authConfig =
        this.configService.get<AuthKeyConfig>(AuthKeyConfigName);

      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: authConfig.expiresIn,
        }),
      };
    } catch (error) {
      this.logger.error(`Signin failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        if (!user.isActive) return null;
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
