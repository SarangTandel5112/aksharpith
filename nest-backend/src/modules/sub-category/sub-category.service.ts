import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SubCategoryRepository } from './sub-category.repository';
import { CategoryService } from '../category/category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { QuerySubCategoryDto } from './dto/query-sub-category.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    private readonly subCatRepo: SubCategoryRepository,
    private readonly categoryService: CategoryService,
  ) {}

  private toDto(sub: any): SubCategoryResponseDto {
    return plainToInstance(SubCategoryResponseDto, sub, { excludeExtraneousValues: true });
  }

  async findAll(query: QuerySubCategoryDto): Promise<PaginatedResponseDto<SubCategoryResponseDto>> {
    const [subs, total] = await this.subCatRepo.findAll(query);
    return new PaginatedResponseDto(subs.map(s => this.toDto(s)), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<SubCategoryResponseDto> {
    const sub = await this.subCatRepo.findById(id);
    if (!sub) throw new NotFoundException(`SubCategory ${id} not found`);
    return this.toDto(sub);
  }

  async create(dto: CreateSubCategoryDto): Promise<SubCategoryResponseDto> {
    // Validate category exists (throws 404 if not)
    await this.categoryService.findOne(dto.categoryId);
    // Check uniqueness on (name, categoryId)
    const existing = await this.subCatRepo.findByNameAndCategory(dto.name, dto.categoryId);
    if (existing) throw new ConflictException(`SubCategory '${dto.name}' already exists in this category`);
    const sub = await this.subCatRepo.create(dto);
    return this.toDto(sub);
  }

  async update(id: string, dto: UpdateSubCategoryDto): Promise<SubCategoryResponseDto> {
    const existing = await this.subCatRepo.findById(id);
    if (!existing) throw new NotFoundException(`SubCategory ${id} not found`);
    if (dto.categoryId) {
      await this.categoryService.findOne(dto.categoryId);
    }
    const nameToCheck = dto.name ?? existing.name;
    const catToCheck = dto.categoryId ?? existing.categoryId;
    if (dto.name || dto.categoryId) {
      const duplicate = await this.subCatRepo.findByNameAndCategory(nameToCheck, catToCheck);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`SubCategory '${nameToCheck}' already exists in this category`);
      }
    }
    const updated = await this.subCatRepo.update(id, dto);
    return this.toDto(updated!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.subCatRepo.softDelete(id);
  }
}
