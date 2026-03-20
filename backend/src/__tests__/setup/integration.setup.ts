import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource, DataSourceOptions } from 'typeorm';

export async function startPostgresContainer(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer('postgres:16-alpine').start();
}

export async function createTestDataSource(
  container: StartedPostgreSqlContainer,
): Promise<DataSource> {
  const options: DataSourceOptions = {
    type: 'postgres',
    host: container.getHost(),
    port: container.getMappedPort(5432),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
    entities: [__dirname + '/../../entities/**/*.entity.ts'],
    synchronize: true,
    logging: false,
  };
  const ds = new DataSource(options);
  await ds.initialize();
  return ds;
}
