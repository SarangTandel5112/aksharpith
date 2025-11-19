import { UserRepository, UserQueryOptions } from './user.repository';
import { CreateUserDto, LoginDto } from './dtos';
import { User } from '@entities';
import { PaginatedResult } from '@common/types';
import { BcryptHelper } from '@helpers/bcrypt.helper';
import { TokenHelper } from '@helpers/token.helper';
import { removePasswordHash, removePassword, validateEntityExists, validateDeletion } from '@helpers/entity.helper';
import logger from '@setup/logger';

/**
 * User Service
 * Uses entity helpers to reduce code duplication
 * Implements business logic for user management and authentication
 */
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(query: UserQueryOptions): Promise<PaginatedResult<Omit<User, 'passwordHash'>>> {
    const result = await this.userRepository.findAll(query);

    // Remove password from all users
    const dataWithoutPassword = result.data.map(user => removePasswordHash(user));

    return {
      ...result,
      data: dataWithoutPassword
    };
  }

  async getUserById(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(id);
    validateEntityExists(user, 'User');

    return removePasswordHash(user);
  }

  async updateUser(id: number, userData: Partial<User> & { password?: string }): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findById(id);
    validateEntityExists(existingUser, 'User');

    // If updating email, check if new email is already taken
    if (userData.email && userData.email !== existingUser.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(userData.email);
      if (userWithSameEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: Partial<User> = { ...userData };

    // If password is provided, hash it
    if (userData.password) {
      updateData.passwordHash = await BcryptHelper.hash(userData.password);
      delete (updateData as any).password;
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    logger.info(`User updated: ${id}`);

    return removePasswordHash(updatedUser!);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    validateEntityExists(user, 'User');

    const deleted = await this.userRepository.delete(id);
    validateDeletion(deleted, 'user');
    logger.info(`User deleted: ${id}`);
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUserByEmail = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await BcryptHelper.hash(createUserDto.password);

    const user = await this.userRepository.create({
      username: createUserDto.username,
      Firstname: createUserDto.Firstname,
      Middlename: createUserDto.Middlename,
      Lastname: createUserDto.Lastname,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      roleId: createUserDto.roleId || 2,
      isTempPassword: false
    });

    logger.info(`User created: ${user.email}`);

    return removePasswordHash(user);
  }

  async register(createUserDto: CreateUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    token: string;
  }> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await BcryptHelper.hash(createUserDto.password);

    const user = await this.userRepository.create({
      username: createUserDto.username,
      Firstname: createUserDto.Firstname,
      Middlename: createUserDto.Middlename,
      Lastname: createUserDto.Lastname,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      roleId: createUserDto.roleId || 2,
      isTempPassword: false
    });

    const token = TokenHelper.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User registered: ${user.email}`);

    return {
      user: removePasswordHash(user),
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    token: string;
  }> {
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
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: removePasswordHash(user),
      token,
    };
  }

  async getProfile(userId: number): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    return removePasswordHash(user);
  }
}
