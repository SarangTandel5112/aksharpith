# Digital Catalogue Backend

A Node.js + Express + TypeScript backend API for managing a digital catalogue, structured with a NestJS-like modular pattern.

## Tech Stack

- **Node.js** with TypeScript
- **Express** framework
- **TypeORM** for database operations
- **PostgreSQL** database
- **Winston** for logging
- **JWT** for authentication
- **bcrypt** for password hashing
- **class-validator** & **class-transformer** for validation
- **Helmet** & **CORS** for security

## Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules (user, catalogue, etc.)
│   │   └── user/
│   │       ├── controllers/    # Route handlers
│   │       ├── services/       # Business logic
│   │       ├── repositories/   # Database operations
│   │       ├── routes/         # Route definitions
│   │       ├── dtos/           # Data Transfer Objects
│   │       ├── entities/       # TypeORM entities
│   │       └── user.module.ts  # Module wiring
│   ├── common/           # Shared utilities (response helper)
│   ├── middlewares/      # Auth, error, validation middlewares
│   ├── config/           # Configuration files
│   ├── setup/            # DI container, logger setup
│   ├── helpers/          # Utility functions (bcrypt, token)
│   ├── types/            # TypeScript types
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
└── package.json
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory. You can either:

**Option 1: Use the setup script (recommended)**

```bash
bash setup-env.sh
```

**Option 2: Create manually**

Create a `.env` file with the following content:

```env
# Server
PORT=3000
NODE_ENV=development
API_PREFIX=/api

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=digital_catalogue

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

**⚠️ Important:** Update `JWT_SECRET` and `JWT_REFRESH_SECRET` with secure random values in production!

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

The build process uses `tsc-alias` to resolve path aliases in the compiled JavaScript.

### Start Production

```bash
npm start
```

### Database Migrations

```bash
# Generate migration
npm run migrate:generate -- -n MigrationName

# Run migrations
npm run migrate

# Revert last migration
npm run migrate:revert
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## API Endpoints

### User Module

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)

### Health Check

- `GET /health` - Server health check

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": Record<string, string[]>
}
```

## Authentication

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Features

- ✅ Modular architecture following SOLID principles
- ✅ Dependency Injection pattern
- ✅ TypeScript for type safety
- ✅ TypeORM for database operations
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Request validation with class-validator
- ✅ Winston logging (console + file)
- ✅ Error handling middleware
- ✅ Security middleware (Helmet, CORS)
- ✅ Consistent response format
- ✅ ESLint + Prettier configuration

## Next Steps

1. Add more modules (catalogue, etc.)
2. Implement refresh token mechanism
3. Add rate limiting
4. Add request validation for all endpoints
5. Add unit and integration tests
6. Add API documentation (Swagger/OpenAPI)
7. Add database migrations
8. Add email verification
9. Add password reset functionality
