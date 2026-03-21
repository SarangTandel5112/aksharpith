import { IProductRepository } from './interfaces/product.repository.interface';
import { IProductMediaRepository } from './interfaces/product-media.repository.interface';
import { IProductMarketingMediaRepository } from './interfaces/product-marketing-media.repository.interface';
import { IProductPhysicalAttributesRepository } from './interfaces/product-physical-attributes.repository.interface';
import { IProductZoneRepository } from './interfaces/product-zone.repository.interface';
import { IProductVendorRepository } from './interfaces/product-vendor.repository.interface';
import {
  IProductGroupFieldValueRepository,
  GroupFieldValueInput,
} from './interfaces/product-group-field-value.repository.interface';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dtos';
import { Product } from '@entities';
import { ProductMedia } from '@entities/product-media.entity';
import { ProductMarketingMedia } from '@entities/product-marketing-media.entity';
import { ProductPhysicalAttributes } from '@entities/product-physical-attributes.entity';
import { ProductZone } from '@entities/product-zone.entity';
import { ProductVendor } from '@entities/product-vendor.entity';
import { ProductGroupFieldValue } from '@entities/product-group-field-value.entity';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

export class ProductService {
  constructor(
    private repo: IProductRepository,
    private mediaRepo: IProductMediaRepository,
    private marketingMediaRepo: IProductMarketingMediaRepository,
    private physicalAttributesRepo: IProductPhysicalAttributesRepository,
    private zoneRepo: IProductZoneRepository,
    private vendorRepo: IProductVendorRepository,
    private groupFieldValueRepo: IProductGroupFieldValueRepository
  ) {}

  async getAllProducts(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    return this.repo.findAll(query);
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.repo.findById(id);
    validateEntityExists(product, 'Product');
    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Check for unique product code
    const existingByCode = await this.repo.findByCode(createProductDto.productCode);
    validateUniqueness(existingByCode, undefined, 'product code', createProductDto.productCode);

    // Check for unique product name
    const existingByName = await this.repo.findByName(createProductDto.productName);
    validateUniqueness(existingByName, undefined, 'product name', createProductDto.productName);

    return this.repo.create(createProductDto);
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.repo.findById(id);
    validateEntityExists(existingProduct, 'Product');

    // Check for unique product code if changing
    if (
      updateProductDto.productCode &&
      updateProductDto.productCode !== existingProduct.productCode
    ) {
      const productWithSameCode = await this.repo.findByCode(updateProductDto.productCode);
      validateUniqueness(productWithSameCode, id, 'product code', updateProductDto.productCode);
    }

    // Check for unique product name if changing
    if (
      updateProductDto.productName &&
      updateProductDto.productName !== existingProduct.productName
    ) {
      const productWithSameName = await this.repo.findByName(updateProductDto.productName);
      validateUniqueness(productWithSameName, id, 'product name', updateProductDto.productName);
    }

    const updated = await this.repo.update(id, updateProductDto);
    // Safe: validated above that product exists
    validateEntityExists(updated, 'Product');
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.repo.findById(id);
    validateEntityExists(product, 'Product');

    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'Product');
  }

  async getProductCount(): Promise<number> {
    return this.repo.count();
  }

  // ---- Media ----

  async getProductMedia(productId: number): Promise<ProductMedia[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.mediaRepo.findByProductId(productId);
  }

  async addProductMedia(productId: number, data: Partial<ProductMedia>): Promise<ProductMedia> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.mediaRepo.create({ ...data, productId });
  }

  async deleteProductMedia(productId: number, mediaId: number): Promise<void> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    const media = await this.mediaRepo.findById(mediaId);
    validateEntityExists(media, 'Media');
    const deleted = await this.mediaRepo.delete(mediaId);
    validateDeletion(deleted, 'Media');
  }

  // ---- Marketing Media ----

  async getProductMarketingMedia(productId: number): Promise<ProductMarketingMedia[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.marketingMediaRepo.findByProductId(productId);
  }

  async addProductMarketingMedia(
    productId: number,
    data: Partial<ProductMarketingMedia>
  ): Promise<ProductMarketingMedia> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.marketingMediaRepo.create({ ...data, productId });
  }

  async deleteProductMarketingMedia(productId: number, mediaId: number): Promise<void> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    const media = await this.marketingMediaRepo.findById(mediaId);
    validateEntityExists(media, 'Marketing media');
    const deleted = await this.marketingMediaRepo.delete(mediaId);
    validateDeletion(deleted, 'Marketing media');
  }

  // ---- Physical Attributes ----

  async getProductPhysicalAttributes(productId: number): Promise<ProductPhysicalAttributes | null> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.physicalAttributesRepo.findByProductId(productId);
  }

  async upsertProductPhysicalAttributes(
    productId: number,
    data: Partial<ProductPhysicalAttributes>
  ): Promise<ProductPhysicalAttributes> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.physicalAttributesRepo.upsert(productId, data);
  }

  // ---- Zones ----

  async getProductZones(productId: number): Promise<ProductZone[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.zoneRepo.findByProductId(productId);
  }

  async upsertProductZones(productId: number, data: Partial<ProductZone>[]): Promise<ProductZone[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.zoneRepo.upsert(productId, data);
  }

  // ---- Vendors ----

  async getProductVendors(productId: number): Promise<ProductVendor[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.vendorRepo.findByProductId(productId);
  }

  async addProductVendor(productId: number, data: Partial<ProductVendor>): Promise<ProductVendor> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.vendorRepo.create({ ...data, productId });
  }

  async deleteProductVendor(productId: number, vendorId: number): Promise<void> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    const vendor = await this.vendorRepo.findById(vendorId);
    validateEntityExists(vendor, 'Vendor');
    const deleted = await this.vendorRepo.delete(vendorId);
    validateDeletion(deleted, 'Vendor');
  }

  // ---- Group Field Values ----

  async getGroupFieldValues(productId: number): Promise<ProductGroupFieldValue[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.groupFieldValueRepo.findByProductId(productId);
  }

  async upsertGroupFieldValues(
    productId: number,
    values: GroupFieldValueInput[]
  ): Promise<ProductGroupFieldValue[]> {
    const product = await this.repo.findById(productId);
    validateEntityExists(product, 'Product');
    await this.groupFieldValueRepo.deleteByProductId(productId);
    return this.groupFieldValueRepo.createMany(productId, values);
  }
}
