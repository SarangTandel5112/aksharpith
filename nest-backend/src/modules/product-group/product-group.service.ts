import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductGroupRepository } from './product-group.repository';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { QueryProductGroupDto } from './dto/query-product-group.dto';
import { ProductGroupResponseDto } from './dto/product-group-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { AddGroupFieldDto } from './dto/add-group-field.dto';
import { UpdateGroupFieldDto } from './dto/update-group-field.dto';
import { GroupField, FieldType } from './entities/group-field.entity';
import { GroupFieldOption } from './entities/group-field-option.entity';
import { CreateGroupFieldOptionDto } from './dto/create-group-field-option.dto';
import { UpdateGroupFieldOptionDto } from './dto/update-group-field-option.dto';

@Injectable()
export class ProductGroupService {
  constructor(private readonly groupRepo: ProductGroupRepository) {}

  private toDto(group: any): ProductGroupResponseDto {
    return plainToInstance(ProductGroupResponseDto, group, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: QueryProductGroupDto,
  ): Promise<PaginatedResponseDto<ProductGroupResponseDto>> {
    const [groups, total] = await this.groupRepo.findAll(query);
    return new PaginatedResponseDto(
      groups.map((g) => this.toDto(g)),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<ProductGroupResponseDto> {
    const group = await this.groupRepo.findById(id);
    if (!group) throw new NotFoundException(`ProductGroup ${id} not found`);
    return this.toDto(group);
  }

  async findWithFields(id: string): Promise<ProductGroupResponseDto> {
    const group = await this.groupRepo.findWithFields(id);
    if (!group) throw new NotFoundException(`ProductGroup ${id} not found`);
    return this.toDto(group);
  }

  async create(dto: CreateProductGroupDto): Promise<ProductGroupResponseDto> {
    const existing = await this.groupRepo.findByName(dto.name);
    if (existing)
      throw new ConflictException(`ProductGroup '${dto.name}' already exists`);
    const group = await this.groupRepo.create(dto);
    return this.toDto(group);
  }

  async update(
    id: string,
    dto: UpdateProductGroupDto,
  ): Promise<ProductGroupResponseDto> {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.groupRepo.findByName(dto.name);
      if (existing && existing.id !== id)
        throw new ConflictException(
          `ProductGroup '${dto.name}' already exists`,
        );
    }
    const group = await this.groupRepo.update(id, dto);
    return this.toDto(group!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.groupRepo.softDelete(id);
  }

  async addField(groupId: string, dto: AddGroupFieldDto): Promise<GroupField> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    return this.groupRepo.addField(groupId, dto);
  }

  async updateField(
    groupId: string,
    fieldId: string,
    dto: UpdateGroupFieldDto & { fieldType?: FieldType },
  ): Promise<GroupField> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    const field = await this.groupRepo.findFieldById(fieldId);
    if (!field || field.groupId !== groupId)
      throw new NotFoundException(
        `Field ${fieldId} not found in group ${groupId}`,
      );
    if (dto.fieldType && dto.fieldType !== field.fieldType) {
      const valueCount = await this.groupRepo.countFieldValues(fieldId);
      if (valueCount > 0)
        throw new ConflictException(
          `Cannot change field type: ${valueCount} products have values for this field`,
        );
    }
    return this.groupRepo.updateField(fieldId, dto) as Promise<GroupField>;
  }

  async removeField(groupId: string, fieldId: string): Promise<void> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    const field = await this.groupRepo.findFieldById(fieldId);
    if (!field || field.groupId !== groupId)
      throw new NotFoundException(
        `Field ${fieldId} not found in group ${groupId}`,
      );
    const valueCount = await this.groupRepo.countFieldValues(fieldId);
    if (valueCount > 0)
      throw new ConflictException(
        `Cannot delete: ${valueCount} products have values for this field`,
      );
    await this.groupRepo.deleteField(fieldId);
  }

  async addOption(
    groupId: string,
    fieldId: string,
    dto: CreateGroupFieldOptionDto,
  ): Promise<GroupFieldOption> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    const field = await this.groupRepo.findFieldById(fieldId);
    if (!field || field.groupId !== groupId)
      throw new NotFoundException(
        `Field ${fieldId} not found in group ${groupId}`,
      );
    return this.groupRepo.addOption(fieldId, dto);
  }

  async updateOption(
    groupId: string,
    fieldId: string,
    optionId: string,
    dto: UpdateGroupFieldOptionDto,
  ): Promise<GroupFieldOption> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    const field = await this.groupRepo.findFieldById(fieldId);
    if (!field || field.groupId !== groupId)
      throw new NotFoundException(
        `Field ${fieldId} not found in group ${groupId}`,
      );
    const option = await this.groupRepo.findOptionById(optionId);
    if (!option || option.fieldId !== fieldId)
      throw new NotFoundException(`Option ${optionId} not found`);
    return this.groupRepo.updateOption(
      optionId,
      dto,
    ) as Promise<GroupFieldOption>;
  }

  async removeOption(
    groupId: string,
    fieldId: string,
    optionId: string,
  ): Promise<void> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    const field = await this.groupRepo.findFieldById(fieldId);
    if (!field || field.groupId !== groupId)
      throw new NotFoundException(
        `Field ${fieldId} not found in group ${groupId}`,
      );
    const option = await this.groupRepo.findOptionById(optionId);
    if (!option || option.fieldId !== fieldId)
      throw new NotFoundException(`Option ${optionId} not found`);
    const usageCount = await this.groupRepo.countOptionUsage(optionId);
    if (usageCount > 0)
      throw new ConflictException(
        `Cannot delete: ${usageCount} products have selected this option`,
      );
    await this.groupRepo.deleteOption(optionId);
  }
}
