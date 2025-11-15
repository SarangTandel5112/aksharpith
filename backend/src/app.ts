import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import 'express-async-errors';
import { appConfig } from '@config/app.config';
import { errorMiddleware } from '@middlewares/error.middleware';
import apiRoutes from './routes';
import logger from '@setup/logger';

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use(appConfig.apiPrefix, apiRoutes);

  // Error handling middleware (must be last)
  app.use(errorMiddleware);

  return app;
};
