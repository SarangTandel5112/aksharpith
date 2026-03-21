import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { createProductRoutes } from './product.routes';
import { AppDataSource } from '@config/database.config';
import { Product } from '@entities/product.entity';

export class ProductModule {
  public router: Router;
  private productController: ProductController;
  private productService: ProductService;
  private productRepository: ProductRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.productRepository = new ProductRepository(AppDataSource.getRepository(Product));
    this.productService = new ProductService(this.productRepository);
    this.productController = new ProductController(this.productService);

    // Create routes
    this.router = createProductRoutes(this.productController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
