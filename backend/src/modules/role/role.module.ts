import { Router } from 'express';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { createRoleRoutes } from './role.routes';

export class RoleModule {
  private repository: RoleRepository;
  private service: RoleService;
  private controller: RoleController;
  private routes: Router;

  constructor() {
    this.repository = new RoleRepository();
    this.service = new RoleService(this.repository);
    this.controller = new RoleController(this.service);
    this.routes = createRoleRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes;
  }
}
