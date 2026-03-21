import { Router } from 'express';
import { AppDataSource } from '@config/database.config';
import { Department } from '@entities/department.entity';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { createDepartmentRoutes } from './department.routes';

export class DepartmentModule {
  public router: Router;
  private departmentController: DepartmentController;
  private departmentService: DepartmentService;
  private departmentRepository: DepartmentRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.departmentRepository = new DepartmentRepository(AppDataSource.getRepository(Department));
    this.departmentService = new DepartmentService(this.departmentRepository);
    this.departmentController = new DepartmentController(this.departmentService);

    // Create routes
    this.router = createDepartmentRoutes(this.departmentController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
