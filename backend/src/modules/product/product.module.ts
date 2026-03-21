import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { ProductMediaRepository } from './product-media.repository';
import { ProductMarketingMediaRepository } from './product-marketing-media.repository';
import { ProductPhysicalAttributesRepository } from './product-physical-attributes.repository';
import { ProductZoneRepository } from './product-zone.repository';
import { ProductVendorRepository } from './product-vendor.repository';
import { ProductGroupFieldValueRepository } from './product-group-field-value.repository';
import { createProductRoutes } from './product.routes';
import { AppDataSource } from '@config/database.config';
import { Product } from '@entities/product.entity';
import { ProductMedia } from '@entities/product-media.entity';
import { ProductMarketingMedia } from '@entities/product-marketing-media.entity';
import { ProductPhysicalAttributes } from '@entities/product-physical-attributes.entity';
import { ProductZone } from '@entities/product-zone.entity';
import { ProductVendor } from '@entities/product-vendor.entity';
import { ProductGroupFieldValue } from '@entities/product-group-field-value.entity';

export class ProductModule {
  public router: Router;
  private productController: ProductController;
  private productService: ProductService;
  private productRepository: ProductRepository;
  private mediaRepository: ProductMediaRepository;
  private marketingMediaRepository: ProductMarketingMediaRepository;
  private physicalAttributesRepository: ProductPhysicalAttributesRepository;
  private zoneRepository: ProductZoneRepository;
  private vendorRepository: ProductVendorRepository;
  private groupFieldValueRepository: ProductGroupFieldValueRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.productRepository = new ProductRepository(AppDataSource.getRepository(Product));
    this.mediaRepository = new ProductMediaRepository(AppDataSource.getRepository(ProductMedia));
    this.marketingMediaRepository = new ProductMarketingMediaRepository(
      AppDataSource.getRepository(ProductMarketingMedia)
    );
    this.physicalAttributesRepository = new ProductPhysicalAttributesRepository(
      AppDataSource.getRepository(ProductPhysicalAttributes)
    );
    this.zoneRepository = new ProductZoneRepository(AppDataSource.getRepository(ProductZone));
    this.vendorRepository = new ProductVendorRepository(AppDataSource.getRepository(ProductVendor));
    this.groupFieldValueRepository = new ProductGroupFieldValueRepository(
      AppDataSource.getRepository(ProductGroupFieldValue)
    );

    this.productService = new ProductService(
      this.productRepository,
      this.mediaRepository,
      this.marketingMediaRepository,
      this.physicalAttributesRepository,
      this.zoneRepository,
      this.vendorRepository,
      this.groupFieldValueRepository
    );
    this.productController = new ProductController(this.productService);

    // Create routes
    this.router = createProductRoutes(this.productController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
