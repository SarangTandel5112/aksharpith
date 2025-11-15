import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '@modules/user/user.repository';
import { createAuthRoutes } from './auth.routes';

export class AuthModule {
  public router: Router;
  private authController: AuthController;
  private authService: AuthService;
  private userRepository: UserRepository;

  constructor() {
    // Initialize dependencies (DI pattern)
    this.userRepository = new UserRepository();
    this.authService = new AuthService(this.userRepository);
    this.authController = new AuthController(this.authService);

    // Create routes
    this.router = createAuthRoutes(this.authController);
  }

  getRoutes(): Router {
    return this.router;
  }
}
