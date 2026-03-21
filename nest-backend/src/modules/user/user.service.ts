import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  private toDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: QueryUserDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const [users, total] = await this.userRepo.findAll(query);
    return new PaginatedResponseDto(
      users.map((u) => this.toDto(u)),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.toDto(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing)
      throw new ConflictException(`Email '${dto.email}' already in use`);

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({ ...dto, password: hashed });
    return this.toDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} not found`);

    const user = await this.userRepo.update(id, dto);
    return this.toDto(user!);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    await this.userRepo.softDelete(id);
  }
}
