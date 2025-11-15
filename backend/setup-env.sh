#!/bin/bash

# Backend environment setup script

cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=/api

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=digital_catalogue

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*

# Logging Configuration
LOG_LEVEL=info
EOF

echo "✅ Backend .env file created successfully!"
echo "⚠️  Please update JWT_SECRET and JWT_REFRESH_SECRET with secure random values in production!"

