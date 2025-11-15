import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CategoryRepository } from '@modules/category/category.repository';
import { createProductRoutes } from './product.routes';

export class ProductModule {
  public router: Router;
  private productController: ProductController;
  private productService: ProductService;
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.productService = new ProductService(
      this.productRepository,
      this.categoryRepository
    );
    this.productController = new ProductController(this.productService);

    // Create routes
    this.router = createProductRoutes(this.productController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
