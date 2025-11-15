import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'digital_catalogue',
  entities: ['src/entities/**/*.entity.ts'],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/**/*.ts'],
  migrationsTableName: 'migrations',
};

export const AppDataSource = new DataSource(dataSourceOptions);
