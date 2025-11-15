import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '@config/database.config';
import { appConfig } from '@config/app.config';
import { createApp } from './app';
import logger from './setup/logger';

dotenv.config();

const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(appConfig.port, () => {
      logger.info(
        `Server is running on port ${appConfig.port} in ${appConfig.env} mode`
      );
      logger.info(`API available at http://localhost:${appConfig.port}${appConfig.apiPrefix}`);
    });

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down server...');
      server.close(async () => {
        await AppDataSource.destroy();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

