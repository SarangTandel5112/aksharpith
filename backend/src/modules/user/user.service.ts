import { IUserRepository } from './interfaces/user.repository.interface';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dtos';
import { User } from '@entities';
import { PaginatedResult } from '@common/types';
import { BcryptHelper } from '@helpers/bcrypt.helper';
import { removePasswordHash, validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';
import logger from '@setup/logger';

export class UserService {
  constructor(private repo: IUserRepository) {}

  async getAllUsers(query: QueryUserDto): Promise<PaginatedResult<Omit<User, 'passwordHash'>>> {
    const result = await this.repo.findAll(query);

    const dataWithoutPassword = result.data.map((user) => removePasswordHash(user));

    return {
      ...result,
      data: dataWithoutPassword,
    };
  }

  async getUserById(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.repo.findById(id);
    validateEntityExists(user, 'User');

    return removePasswordHash(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUserByEmail = await this.repo.findByEmail(createUserDto.email);
    validateUniqueness(existingUserByEmail, undefined, 'email', createUserDto.email);

    const hashedPassword = await BcryptHelper.hash(createUserDto.password);

    const user = await this.repo.create({
      username: createUserDto.username,
      Firstname: createUserDto.Firstname,
      Middlename: createUserDto.Middlename,
      Lastname: createUserDto.Lastname,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      roleId: createUserDto.roleId ?? 2,
      isTempPassword: false,
    });

    logger.info(`User created: ${user.email}`);

    return removePasswordHash(user);
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.repo.findById(id);
    validateEntityExists(existingUser, 'User');

    if (userData.email && userData.email !== existingUser.email) {
      const userWithSameEmail = await this.repo.findByEmail(userData.email);
      validateUniqueness(userWithSameEmail, id, 'email', userData.email);
    }

    const updateData: Partial<User> = { ...userData } as Partial<User>;

    if (userData.password) {
      updateData.passwordHash = await BcryptHelper.hash(userData.password);
      delete (updateData as Record<string, unknown>).password;
    }

    const updatedUser = await this.repo.update(id, updateData);
    validateEntityExists(updatedUser, 'User');

    logger.info(`User updated: ${id}`);

    return removePasswordHash(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.repo.findById(id);
    validateEntityExists(user, 'User');

    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'User');
    logger.info(`User deleted: ${id}`);
  }

  async getUserCount(): Promise<number> {
    return this.repo.count();
  }
}
