import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  private toDto(cat: any): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, cat, { excludeExtraneousValues: true });
  }

  async findAll(query: QueryCategoryDto): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const [cats, total] = await this.categoryRepo.findAll(query);
    return new PaginatedResponseDto(cats.map(c => this.toDto(c)), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const cat = await this.categoryRepo.findById(id);
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return this.toDto(cat);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepo.findByName(dto.name);
    if (existing) throw new ConflictException(`Category '${dto.name}' already exists`);
    const cat = await this.categoryRepo.create(dto);
    return this.toDto(cat);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.categoryRepo.findByName(dto.name);
      if (existing && existing.id !== id) throw new ConflictException(`Category '${dto.name}' already exists`);
    }
    const cat = await this.categoryRepo.update(id, dto);
    return this.toDto(cat!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.categoryRepo.softDelete(id);
  }
}
