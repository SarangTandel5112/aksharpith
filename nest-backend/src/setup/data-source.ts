import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Load .env from nest-backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const user = process.env.DB_USER;
const password = encodeURIComponent(process.env.DB_PWD || '');
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const name = process.env.DB_NAME;

export default new DataSource({
  type: 'postgres',
  url: `postgres://${user}:${password}@${host}:${port}/${name}`,
  entities: [path.join(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});
