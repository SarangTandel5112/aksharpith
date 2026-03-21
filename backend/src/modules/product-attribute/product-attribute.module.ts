import { Router } from 'express';
import { AppDataSource } from '@config/database.config';
import { ProductAttribute } from '@entities/product-attribute.entity';
import { ProductAttributeValue } from '@entities/product-attribute-value.entity';
import { Product } from '@entities/product.entity';
import { ProductAttributeRepository } from './product-attribute.repository';
import { ProductAttributeValueRepository } from './product-attribute-value.repository';
import { ProductAttributeService } from './product-attribute.service';
import { ProductAttributeController } from './product-attribute.controller';
import { createProductAttributeRoutes } from './product-attribute.routes';
import { ProductRepository } from '@modules/product/product.repository';

export class ProductAttributeModule {
  private attrRepository: ProductAttributeRepository;
  private valueRepository: ProductAttributeValueRepository;
  private productRepository: ProductRepository;
  private service: ProductAttributeService;
  private controller: ProductAttributeController;
  private routes: Router;

  constructor() {
    this.productRepository = new ProductRepository(AppDataSource.getRepository(Product));
    this.attrRepository = new ProductAttributeRepository(
      AppDataSource.getRepository(ProductAttribute)
    );
    this.valueRepository = new ProductAttributeValueRepository(
      AppDataSource.getRepository(ProductAttributeValue)
    );
    this.service = new ProductAttributeService(
      this.attrRepository,
      this.valueRepository,
      this.productRepository
    );
    this.controller = new ProductAttributeController(this.service);
    this.routes = createProductAttributeRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes;
  }
}
