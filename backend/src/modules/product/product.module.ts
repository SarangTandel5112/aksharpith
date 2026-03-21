import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CategoryRepository } from '@modules/category/category.repository';
import { DepartmentRepository } from '@modules/department/department.repository';
import { SubCategoryRepository } from '@modules/sub-category/sub-category.repository';
import { createProductRoutes } from './product.routes';
import { AppDataSource } from '@config/database.config';
import { Department } from '@entities/department.entity';

export class ProductModule {
  public router: Router;
  private productController: ProductController;
  private productService: ProductService;
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;
  private departmentRepository: DepartmentRepository;
  private subCategoryRepository: SubCategoryRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.departmentRepository = new DepartmentRepository(
      AppDataSource.getRepository(Department)
    );
    this.subCategoryRepository = new SubCategoryRepository();
    this.productService = new ProductService(
      this.productRepository,
      this.categoryRepository,
      this.departmentRepository,
      this.subCategoryRepository
    );
    this.productController = new ProductController(this.productService);

    // Create routes
    this.router = createProductRoutes(this.productController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
