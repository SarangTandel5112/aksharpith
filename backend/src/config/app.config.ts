import * as dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
};

