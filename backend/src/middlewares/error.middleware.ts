import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '@common/response.helper';
import logger from '@setup/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle validation errors (from class-validator)
  if (err.name === 'ValidationError') {
    ResponseHelper.validationError(res, {
      general: [err.message],
    });
    return;
  }

  // Handle JWT errors
  if (err.message.includes('token')) {
    ResponseHelper.unauthorized(res, err.message);
    return;
  }

  // Default error response
  ResponseHelper.error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    500
  );
};

