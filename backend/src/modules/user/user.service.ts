import { UserRepository, UserQueryOptions, PaginatedResult } from './user.repository';
import { CreateUserDto, LoginDto } from './dtos';
import { User } from '@entities';
import { BcryptHelper } from '@helpers/bcrypt.helper';
import { TokenHelper } from '@helpers/token.helper';
import logger from '@setup/logger';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(query: UserQueryOptions): Promise<PaginatedResult<Omit<User, 'passwordHash'>>> {
    const result = await this.userRepository.findAll(query);

    // Remove password from all users
    const dataWithoutPassword = result.data.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      ...result,
      data: dataWithoutPassword
    };
  }

  async getUserById(id: number): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: number, userData: Partial<User> & { password?: string }): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

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
      const hashedPassword = await BcryptHelper.hash(userData.password);
      updateData.passwordHash = hashedPassword;
      delete (updateData as any).password; // Remove plain password from update data
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    logger.info(`User updated: ${id}`);

    const { passwordHash, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword;
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete user');
    }
    logger.info(`User deleted: ${id}`);
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await BcryptHelper.hash(createUserDto.password);

    // Create user
    const user = await this.userRepository.create({
      username: createUserDto.username,
      Firstname: createUserDto.Firstname,
      Middlename: createUserDto.Middlename,
      Lastname: createUserDto.Lastname,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      roleId: createUserDto.roleId || 2, // Default to User role
      isTempPassword: false
    });

    logger.info(`User created: ${user.email}`);

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register(createUserDto: CreateUserDto): Promise<{
    user: Omit<User, 'password'>;
    token: string;
  }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await BcryptHelper.hash(createUserDto.password);

    // Create user
    const user = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
    });

    // Generate JWT token
    const token = TokenHelper.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User registered: ${user.email}`);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: Omit<User, 'password'>;
    token: string;
  }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await BcryptHelper.compare(
      loginDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = TokenHelper.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User logged in: ${user.email}`);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
