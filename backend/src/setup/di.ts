// Simple DI container for dependency injection
// This can be extended to use a more sophisticated DI library like InversifyJS

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not found`);
    }
    return factory();
  }

  clear(): void {
    this.services.clear();
  }
}

export const container = DIContainer.getInstance();

