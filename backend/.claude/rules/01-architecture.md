# 01 — Architecture

Read this on every session before writing any code.

## Layer Map

```
src/
  entities/          TypeORM entity files (one per table)
  modules/<feature>/ Feature module (service, repo, controller, routes, DTOs, interfaces, tests)
  common/            Shared base classes and interfaces
  helpers/           Pure utility functions (no I/O side effects)
  middlewares/       Express middleware
  config/            Database and app config
  routes/            Top-level Express router (wires module routes)
  setup/             DI container, logger
  migrations/        TypeORM migration files
  __tests__/         Shared test utilities and factories
```

## Layer Rules (strict)

```
Controller  →  Service (via interface)  →  Repository (via interface)  →  TypeORM
```

- Controllers: thin HTTP adapters only. No business logic.
- Services: depend on IRepository interfaces, never concrete classes or AppDataSource.
- Repositories: extend BaseRepository, accept injected Repository<T>.
- AppDataSource: only imported in *.module.ts and integration test setup.
- No module imports another module's repository. Cross-module data goes through services.

## Folder Decision

When creating a file, ask:
1. Is it a TypeORM entity? → `src/entities/`
2. Is it part of a feature? → `src/modules/<feature>/`
3. Is it reused across features (pure function, no state)? → `src/helpers/`
4. Is it Express middleware? → `src/middlewares/`
5. Is it a shared base class or interface? → `src/common/`
