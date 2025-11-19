import { Router } from 'express';
import { SubCategoryController } from './sub-category.controller';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryRepository } from './sub-category.repository';
import { createSubCategoryRoutes } from './sub-category.routes';

export class SubCategoryModule {
  public router: Router;
  private subCategoryController: SubCategoryController;
  private subCategoryService: SubCategoryService;
  private subCategoryRepository: SubCategoryRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.subCategoryRepository = new SubCategoryRepository();
    this.subCategoryService = new SubCategoryService(this.subCategoryRepository);
    this.subCategoryController = new SubCategoryController(this.subCategoryService);

    // Create routes
    this.router = createSubCategoryRoutes(this.subCategoryController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
