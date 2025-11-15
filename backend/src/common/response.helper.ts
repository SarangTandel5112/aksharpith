import { Response } from 'express';
import { ApiResponse } from '@types';

export class ResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }
}
