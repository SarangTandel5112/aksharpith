import { Router } from 'express';
import { AppDataSource } from '@config/database.config';
import { ProductGroup } from '@entities/product-group.entity';
import { ProductGroupRepository } from './product-group.repository';
import { ProductGroupService } from './product-group.service';
import { ProductGroupController } from './product-group.controller';
import { createProductGroupRoutes } from './product-group.routes';

export class ProductGroupModule {
  private repository: ProductGroupRepository;
  private service: ProductGroupService;
  private controller: ProductGroupController;
  private routes: Router;

  constructor() {
    this.repository = new ProductGroupRepository(AppDataSource.getRepository(ProductGroup));
    this.service = new ProductGroupService(this.repository);
    this.controller = new ProductGroupController(this.service);
    this.routes = createProductGroupRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes;
  }
}
