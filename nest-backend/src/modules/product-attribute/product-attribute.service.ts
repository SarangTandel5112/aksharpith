import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductAttributeRepository } from './product-attribute.repository';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { QueryProductAttributeDto } from './dto/query-product-attribute.dto';
import { ProductAttributeResponseDto } from './dto/product-attribute-response.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class ProductAttributeService {
  constructor(private readonly attrRepo: ProductAttributeRepository) {}

  private toDto(attr: unknown): ProductAttributeResponseDto {
    return plainToInstance(ProductAttributeResponseDto, attr, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: QueryProductAttributeDto,
  ): Promise<PaginatedResponseDto<ProductAttributeResponseDto>> {
    const [attrs, total] = await this.attrRepo.findAll(query);
    return new PaginatedResponseDto(
      attrs.map((a) => this.toDto(a)),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<ProductAttributeResponseDto> {
    const attr = await this.attrRepo.findById(id);
    if (!attr) throw new NotFoundException(`ProductAttribute ${id} not found`);
    return this.toDto(attr);
  }

  async findWithValues(id: string): Promise<ProductAttributeResponseDto> {
    const attr = await this.attrRepo.findWithValues(id);
    if (!attr) throw new NotFoundException(`ProductAttribute ${id} not found`);
    return this.toDto(attr);
  }

  async create(dto: CreateProductAttributeDto): Promise<ProductAttributeResponseDto> {
    const existing = await this.attrRepo.findByName(dto.name);
    if (existing) throw new ConflictException(`ProductAttribute '${dto.name}' already exists`);
    const attr = await this.attrRepo.create(dto);
    return this.toDto(attr);
  }

  async update(
    id: string,
    dto: UpdateProductAttributeDto,
  ): Promise<ProductAttributeResponseDto> {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.attrRepo.findByName(dto.name);
      if (existing && existing.id !== id)
        throw new ConflictException(`ProductAttribute '${dto.name}' already exists`);
    }
    const attr = await this.attrRepo.update(id, dto);
    return this.toDto(attr!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attrRepo.softDelete(id);
  }

  async addValue(attributeId: string, dto: CreateAttributeValueDto) {
    await this.findOne(attributeId);
    return this.attrRepo.addValue(attributeId, dto);
  }

  async updateValue(attributeId: string, valueId: string, dto: UpdateAttributeValueDto) {
    await this.findOne(attributeId);
    const val = await this.attrRepo.findValueById(valueId);
    if (!val || val.attributeId !== attributeId)
      throw new NotFoundException(`AttributeValue ${valueId} not found`);
    return this.attrRepo.updateValue(valueId, dto);
  }

  async removeValue(attributeId: string, valueId: string): Promise<void> {
    await this.findOne(attributeId);
    const val = await this.attrRepo.findValueById(valueId);
    if (!val || val.attributeId !== attributeId)
      throw new NotFoundException(`AttributeValue ${valueId} not found`);
    await this.attrRepo.softDeleteValue(valueId);
  }
}
