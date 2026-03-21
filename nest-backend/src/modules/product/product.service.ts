import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { UpsertPhysicalAttributesDto } from './dto/upsert-physical-attributes.dto';
import { CreateMarketingMediaDto } from './dto/create-marketing-media.dto';
import { CreateProductZoneDto } from './dto/create-product-zone.dto';
import { UpsertGroupFieldValueDto } from './dto/upsert-group-field-value.dto';
import { BulkUpsertGroupFieldValuesDto } from './dto/bulk-upsert-group-field-values.dto';
import { CreateProductVendorDto } from './dto/create-product-vendor.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { ProductMedia } from './entities/product-media.entity';
import { ProductPhysicalAttributes } from './entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from './entities/product-marketing-media.entity';
import { ProductZone } from './entities/product-zone.entity';
import { ProductGroupFieldValue } from './entities/product-group-field-value.entity';
import { ProductVendor } from './entities/product-vendor.entity';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  private toDto(p: unknown): ProductResponseDto {
    return plainToInstance(ProductResponseDto, p, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: QueryProductDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const [products, total] = await this.productRepo.findAll(query);
    return new PaginatedResponseDto(
      products.map((p) => this.toDto(p)),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return this.toDto(product);
  }

  async getStats(): Promise<Record<string, number>> {
    return this.productRepo.countByType();
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.productRepo.findBySku(dto.sku);
    if (existing)
      throw new ConflictException(`SKU '${dto.sku}' already exists`);
    const product = await this.productRepo.create(dto);
    return this.toDto(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const existing = await this.productRepo.findById(id);
    if (!existing) throw new NotFoundException(`Product ${id} not found`);
    if (dto.sku) {
      const skuConflict = await this.productRepo.findBySku(dto.sku);
      if (skuConflict && skuConflict.id !== id) {
        throw new ConflictException(`SKU '${dto.sku}' already exists`);
      }
    }
    // Group change protection
    if (dto.groupId && dto.groupId !== existing.groupId) {
      const valueCount = await this.productRepo.countGroupFieldValues(id);
      if (valueCount > 0) {
        if (!(dto as any).clearFieldValues) {
          throw new ConflictException(
            `Cannot change group: ${valueCount} field values exist. Pass clearFieldValues: true to delete them.`,
          );
        }
        await this.productRepo.deleteGroupFieldValues(id);
      }
    }
    const product = await this.productRepo.update(id, dto);
    return this.toDto(product!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepo.softDelete(id);
  }

  async addMedia(
    productId: string,
    dto: CreateProductMediaDto,
  ): Promise<ProductMedia> {
    await this.findOne(productId);
    return this.productRepo.addMedia(productId, dto);
  }

  async getMedia(productId: string): Promise<ProductMedia[]> {
    await this.findOne(productId);
    return this.productRepo.getMedia(productId);
  }

  async deleteMedia(productId: string, mediaId: string): Promise<void> {
    await this.findOne(productId);
    const deleted = await this.productRepo.deleteMedia(mediaId);
    if (!deleted) throw new NotFoundException(`Media ${mediaId} not found`);
  }

  async upsertPhysicalAttributes(
    productId: string,
    dto: UpsertPhysicalAttributesDto,
  ): Promise<ProductPhysicalAttributes> {
    await this.findOne(productId);
    return this.productRepo.upsertPhysicalAttributes(productId, dto);
  }

  async getPhysicalAttributes(
    productId: string,
  ): Promise<ProductPhysicalAttributes | null> {
    await this.findOne(productId);
    return this.productRepo.getPhysicalAttributes(productId);
  }

  async addMarketingMedia(
    productId: string,
    dto: CreateMarketingMediaDto,
  ): Promise<ProductMarketingMedia> {
    await this.findOne(productId);
    return this.productRepo.addMarketingMedia(productId, dto);
  }

  async getMarketingMedia(productId: string): Promise<ProductMarketingMedia[]> {
    await this.findOne(productId);
    return this.productRepo.getMarketingMedia(productId);
  }

  async removeMarketingMedia(
    productId: string,
    mediaId: string,
  ): Promise<void> {
    await this.findOne(productId);
    const deleted = await this.productRepo.removeMarketingMedia(mediaId);
    if (!deleted)
      throw new NotFoundException(`Marketing media ${mediaId} not found`);
  }

  async addZone(
    productId: string,
    dto: CreateProductZoneDto,
  ): Promise<ProductZone> {
    await this.findOne(productId);
    return this.productRepo.addZone(productId, dto);
  }

  async getZones(productId: string): Promise<ProductZone[]> {
    await this.findOne(productId);
    return this.productRepo.getZones(productId);
  }

  async updateZone(
    productId: string,
    zoneId: string,
    dto: Partial<CreateProductZoneDto>,
  ): Promise<void> {
    await this.findOne(productId);
    await this.productRepo.updateZone(zoneId, dto);
  }

  async removeZone(productId: string, zoneId: string): Promise<void> {
    await this.findOne(productId);
    const deleted = await this.productRepo.removeZone(zoneId);
    if (!deleted) throw new NotFoundException(`Zone ${zoneId} not found`);
  }

  async upsertGroupFieldValue(
    productId: string,
    dto: UpsertGroupFieldValueDto,
  ): Promise<ProductGroupFieldValue> {
    await this.findOne(productId);
    return this.productRepo.upsertGroupFieldValue(productId, dto);
  }

  async getGroupFieldValues(
    productId: string,
  ): Promise<ProductGroupFieldValue[]> {
    await this.findOne(productId);
    return this.productRepo.getGroupFieldValues(productId);
  }

  async removeGroupFieldValue(
    productId: string,
    fieldId: string,
  ): Promise<void> {
    await this.findOne(productId);
    const deleted = await this.productRepo.removeGroupFieldValue(
      productId,
      fieldId,
    );
    if (!deleted)
      throw new NotFoundException(`Field value for field ${fieldId} not found`);
  }

  async bulkUpsertGroupFieldValues(
    productId: string,
    dto: BulkUpsertGroupFieldValuesDto,
  ): Promise<void> {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    if (!product.groupId)
      throw new BadRequestException('Product has no group assigned');
    await this.productRepo.bulkUpsertGroupFieldValues(productId, dto.values);
  }

  async getGroupFieldValuesBulk(
    productId: string,
  ): Promise<ProductGroupFieldValue[]> {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return this.productRepo.getGroupFieldValues(productId);
  }

  async addVendor(
    productId: string,
    dto: CreateProductVendorDto,
  ): Promise<ProductVendor> {
    await this.findOne(productId);
    return this.productRepo.addVendor(productId, dto);
  }

  async getVendors(productId: string): Promise<ProductVendor[]> {
    await this.findOne(productId);
    return this.productRepo.getVendors(productId);
  }

  async updateVendor(
    productId: string,
    vendorId: string,
    dto: Partial<CreateProductVendorDto>,
  ): Promise<void> {
    await this.findOne(productId);
    await this.productRepo.updateVendor(vendorId, dto);
  }

  async removeVendor(productId: string, vendorId: string): Promise<void> {
    await this.findOne(productId);
    const deleted = await this.productRepo.removeVendor(vendorId);
    if (!deleted) throw new NotFoundException(`Vendor ${vendorId} not found`);
  }
}
