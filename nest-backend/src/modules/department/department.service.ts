import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DepartmentRepository } from './department.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly deptRepo: DepartmentRepository) {}

  private toDto(dept: any): DepartmentResponseDto {
    return plainToInstance(DepartmentResponseDto, dept, { excludeExtraneousValues: true });
  }

  async findAll(query: QueryDepartmentDto): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const [depts, total] = await this.deptRepo.findAll(query);
    return new PaginatedResponseDto(depts.map(d => this.toDto(d)), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const dept = await this.deptRepo.findById(id);
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return this.toDto(dept);
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.deptRepo.findByName(dto.name);
    if (existing) throw new ConflictException(`Department '${dto.name}' already exists`);
    const dept = await this.deptRepo.create(dto);
    return this.toDto(dept);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.deptRepo.findByName(dto.name);
      if (existing && existing.id !== id) throw new ConflictException(`Department '${dto.name}' already exists`);
    }
    const dept = await this.deptRepo.update(id, dto);
    return this.toDto(dept!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.deptRepo.softDelete(id);
  }
}
