import { Router } from 'express';
import { AppDataSource } from '@config/database.config';
import { ProductVariant } from '@entities/product-variant.entity';
import { Product } from '@entities/product.entity';
import { ProductVariantRepository } from './product-variant.repository';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { createProductVariantRoutes } from './product-variant.routes';
import { ProductRepository } from '@modules/product/product.repository';

export class ProductVariantModule {
  private variantRepository: ProductVariantRepository;
  private productRepository: ProductRepository;
  private service: ProductVariantService;
  private controller: ProductVariantController;
  private routes: Router;

  constructor() {
    this.variantRepository = new ProductVariantRepository(
      AppDataSource.getRepository(ProductVariant)
    );
    this.productRepository = new ProductRepository(
      AppDataSource.getRepository(Product)
    );
    this.service = new ProductVariantService(this.variantRepository, this.productRepository);
    this.controller = new ProductVariantController(this.service);
    this.routes = createProductVariantRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes;
  }
}
