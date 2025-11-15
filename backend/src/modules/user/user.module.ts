import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { createUserRoutes } from './user.routes';

export class UserModule {
  public router: Router;
  private userController: UserController;
  private userService: UserService;
  private userRepository: UserRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.userRepository = new UserRepository();
    this.userService = new UserService(this.userRepository);
    this.userController = new UserController(this.userService);

    // Create routes
    this.router = createUserRoutes(this.userController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
