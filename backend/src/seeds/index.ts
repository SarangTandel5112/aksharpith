import 'reflect-metadata';
import { AppDataSource } from '@config/database.config';
import { seedUserRoles } from './userRoles.seed';
import logger from '@setup/logger';

const runSeeders = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized for seeding');

    // Run seeders
    await seedUserRoles();

    logger.info('All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error running seeders:', error);
    process.exit(1);
  }
};

runSeeders();
