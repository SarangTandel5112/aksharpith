import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  private toDto(role: any): RoleResponseDto {
    return plainToInstance(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: QueryRoleDto,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const [roles, total] = await this.roleRepo.findAll(query);
    return new PaginatedResponseDto(
      roles.map((r) => this.toDto(r)),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return this.toDto(role);
  }

  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.roleRepo.findByName(dto.roleName);
    if (existing)
      throw new ConflictException(`Role '${dto.roleName}' already exists`);
    const role = await this.roleRepo.create(dto);
    return this.toDto(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    await this.findOne(id);
    if (dto.roleName) {
      const existing = await this.roleRepo.findByName(dto.roleName);
      if (existing && existing.id !== id)
        throw new ConflictException(`Role '${dto.roleName}' already exists`);
    }
    const role = await this.roleRepo.update(id, dto);
    return this.toDto(role!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.roleRepo.softDelete(id);
  }
}
