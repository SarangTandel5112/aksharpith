# Dependency Injection (DI) Explained

## What is Dependency Injection?

Dependency Injection (DI) is a design pattern where objects receive their dependencies from an external source rather than creating them internally. This makes code more:

- **Testable** - Easy to mock dependencies
- **Maintainable** - Loose coupling between components
- **Flexible** - Easy to swap implementations
- **Reusable** - Components don't depend on concrete implementations

---

## How DI Works in This Codebase

### Current Implementation

Your codebase uses **Constructor Injection** pattern, where dependencies are passed through constructors.

### Dependency Chain

```
UserController
    ↓ depends on
UserService
    ↓ depends on
UserRepository
    ↓ depends on
TypeORM Repository (AppDataSource)
```

---

## Step-by-Step Flow

### 1. **UserModule** - The Wiring Point

```typescript
// src/modules/user/user.module.ts
export class UserModule {
  constructor() {
    // Step 1: Create the lowest level dependency first
    this.userRepository = new UserRepository();

    // Step 2: Inject repository into service
    this.userService = new UserService(this.userRepository);

    // Step 3: Inject service into controller
    this.userController = new UserController(this.userService);

    // Step 4: Create routes with controller
    this.router = createUserRoutes(this.userController);
  }
}
```

### 2. **UserRepository** - Data Layer

```typescript
// src/modules/user/user.repository.ts
export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    // Gets TypeORM repository from AppDataSource
    this.repository = AppDataSource.getRepository(User);
  }

  // Database operations...
}
```

### 3. **UserService** - Business Logic Layer

```typescript
// src/modules/user/user.service.ts
export class UserService {
  // Constructor receives repository as dependency
  constructor(private userRepository: UserRepository) {}

  async register(createUserDto: CreateUserDto) {
    // Uses injected repository
    const existingUser = await this.userRepository.findByEmail(...);
    // Business logic here...
  }
}
```

### 4. **UserController** - Request Handler Layer

```typescript
// src/modules/user/user.controller.ts
export class UserController {
  // Constructor receives service as dependency
  constructor(private userService: UserService) {}

  register = async (req: Request, res: Response) => {
    // Uses injected service
    const result = await this.userService.register(req.body);
    // Handle response...
  };
}
```

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────┐
│          HTTP Request                   │
│     POST /api/users/register            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      UserController                     │
│  (needs UserService)                    │
│  ┌──────────────────────────────────┐  │
│  │ constructor(userService)         │  │
│  │ register() {                      │  │
│  │   userService.register()          │  │
│  │ }                                 │  │
│  └──────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │ uses
               ▼
┌─────────────────────────────────────────┐
│      UserService                        │
│  (needs UserRepository)                 │
│  ┌──────────────────────────────────┐  │
│  │ constructor(userRepository)      │  │
│  │ register() {                     │  │
│  │   userRepository.findByEmail()   │  │
│  │   userRepository.create()        │  │
│  │ }                                 │  │
│  └──────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │ uses
               ▼
┌─────────────────────────────────────────┐
│      UserRepository                     │
│  (needs TypeORM Repository)             │
│  ┌──────────────────────────────────┐  │
│  │ constructor() {                  │  │
│  │   this.repository =              │  │
│  │     AppDataSource.getRepository()│  │
│  │ }                                 │  │
│  │ findByEmail() { ... }            │  │
│  │ create() { ... }                  │  │
│  └──────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Benefits of This Pattern

### 1. **Testability**

```typescript
// Easy to test by injecting mock dependencies
class MockUserRepository {
  async findByEmail() {
    return null;
  }
}

const mockRepo = new MockUserRepository();
const userService = new UserService(mockRepo);
// Now you can test UserService without a real database
```

### 2. **Loose Coupling**

- `UserController` doesn't know how `UserService` works internally
- `UserService` doesn't know how `UserRepository` queries the database
- Each layer only depends on the interface, not implementation

### 3. **Single Responsibility**

- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic
- **Repository**: Handles database operations

### 4. **Easy to Extend**

```typescript
// Want to add caching? Just inject a cache service
class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService // New dependency
  ) {}
}
```

---

## DI Container (Optional Usage)

You have a DI container available (`src/setup/di.ts`), but currently not used. Here's how you could use it:

### Current Approach (Manual)

```typescript
// In UserModule
this.userRepository = new UserRepository();
this.userService = new UserService(this.userRepository);
this.userController = new UserController(this.userService);
```

### Using DI Container

```typescript
// Register dependencies
container.register('UserRepository', () => new UserRepository());
container.register(
  'UserService',
  () => new UserService(container.resolve('UserRepository'))
);
container.register(
  'UserController',
  () => new UserController(container.resolve('UserService'))
);

// Resolve
const controller = container.resolve('UserController');
```

---

## Real Example from Your Code

### Request Flow:

1. **User sends**: `POST /api/users/register` with email/password

2. **Route Handler** (`user.routes.ts`):

   ```typescript
   router.post(
     '/register',
     validationMiddleware(CreateUserDto),
     userController.register // ← Uses injected controller
   );
   ```

3. **Controller** (`user.controller.ts`):

   ```typescript
   register = async (req, res) => {
     // Uses injected service
     const result = await this.userService.register(req.body);
     ResponseHelper.success(res, result);
   };
   ```

4. **Service** (`user.service.ts`):

   ```typescript
   async register(createUserDto) {
     // Uses injected repository
     const existingUser = await this.userRepository.findByEmail(...);
     // Business logic...
     const user = await this.userRepository.create(...);
     return { user, token };
   }
   ```

5. **Repository** (`user.repository.ts`):
   ```typescript
   async findByEmail(email) {
     // Uses TypeORM repository
     return this.repository.findOne({ where: { email } });
   }
   ```

---

## Key Principles

### 1. **Dependency Inversion Principle (DIP)**

- High-level modules (Controller) don't depend on low-level modules (Repository)
- Both depend on abstractions (interfaces)

### 2. **Inversion of Control (IoC)**

- Objects don't create their dependencies
- Dependencies are provided externally (via constructor)

### 3. **Single Responsibility**

- Each class has one reason to change
- Controller changes when HTTP handling changes
- Service changes when business logic changes
- Repository changes when database structure changes

---

## Summary

Your DI implementation:
✅ Uses **Constructor Injection**
✅ Manual wiring in **UserModule**
✅ Clear separation of concerns
✅ Easy to test and maintain
✅ Follows SOLID principles

The pattern ensures that:

- Each component only knows about its immediate dependencies
- Dependencies flow from bottom to top (Repository → Service → Controller)
- Easy to test by mocking dependencies
- Easy to modify without breaking other components
