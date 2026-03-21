import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAll(query: QueryUserDto): Promise<[User[], number]> {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      order = 'ASC',
      search,
      roleId,
      isActive,
    } = query;

    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = [];

    if (search) {
      const base: FindOptionsWhere<User> = {};
      if (roleId !== undefined) base.roleId = roleId;
      if (isActive !== undefined) base.isActive = isActive;

      where.push({ ...base, firstName: ILike(`%${search}%`) });
      where.push({ ...base, email: ILike(`%${search}%`) });
    } else {
      const base: FindOptionsWhere<User> = {};
      if (roleId !== undefined) base.roleId = roleId;
      if (isActive !== undefined) base.isActive = isActive;
      where.push(base);
    }

    return this.repo.findAndCount({
      where,
      relations: ['role'],
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['role'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto & { password: string }): Promise<User> {
    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
