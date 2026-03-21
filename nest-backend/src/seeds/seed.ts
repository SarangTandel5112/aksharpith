import * as path from 'path';

// Load .env before any database access. The .env file sits one level above
// nest-backend (i.e. next to the monorepo root), so we walk up two directories
// from the compiled location (dist/seeds/) or three from the source root.
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

import { DataSource, DataSourceOptions } from 'typeorm';
import { seedRoles } from './roles.seed';

function buildDataSourceOptions(): DataSourceOptions {
  const user = process.env.DB_USER;
  const password = process.env.DB_PWD;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const name = process.env.DB_NAME;

  if (!user || !password || !host || !port || !name) {
    throw new Error(
      'Missing required database environment variables. ' +
        'Ensure DB_USER, DB_PWD, DB_HOST, DB_PORT, and DB_NAME are set in your .env file.',
    );
  }

  const encodedPassword = encodeURIComponent(password);
  const url = `postgres://${user}:${encodedPassword}@${host}:${port}/${name}`;

  return {
    type: 'postgres',
    url,
    // Resolve entities relative to this file so the path works for both
    // ts-node (src/) and compiled output (dist/).
    entities: [path.join(__dirname, '../modules/**/*.entity.{ts,js}')],
    synchronize: false,
    logging: false,
    extra: {
      connectionTimeoutMillis: 60_000,
      idleTimeoutMillis: 45_000,
    },
  };
}

async function runSeed(): Promise<void> {
  console.log('Starting database seed...');

  const dataSource = new DataSource(buildDataSourceOptions());

  try {
    await dataSource.initialize();
    console.log('Database connected.');

    await seedRoles(dataSource);

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
