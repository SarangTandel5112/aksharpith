import { Router } from 'express';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { createCategoryRoutes } from './category.routes';

export class CategoryModule {
  public router: Router;
  private categoryController: CategoryController;
  private categoryService: CategoryService;
  private categoryRepository: CategoryRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.categoryRepository = new CategoryRepository();
    this.categoryService = new CategoryService(this.categoryRepository);
    this.categoryController = new CategoryController(this.categoryService);

    // Create routes
    this.router = createCategoryRoutes(this.categoryController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
