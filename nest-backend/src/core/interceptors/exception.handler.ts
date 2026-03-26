import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { StatusCode } from '../http/response';
import { WinstonLogger } from '../../setup/winston.logger';
import { PostgresErrorCode } from '../../utils/constants';

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  constructor(
    private readonly logger: WinstonLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let statusCode = StatusCode.FAILURE;
    let message = 'Something went wrong';
    let errors: string[] | undefined;

    if (exception instanceof QueryFailedError) {
      const code = (exception as QueryFailedError & {
        driverError?: { code?: string };
      }).driverError?.code;

      switch (code) {
        case PostgresErrorCode.UNIQUE_VIOLATION:
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          break;
        case PostgresErrorCode.FOREIGN_KEY_VIOLATION:
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference supplied';
          break;
        default:
          this.logger.error(exception.message, exception.stack);
          break;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const responseMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse['message'];

      const responseErrors =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse['errors'];

      if (Array.isArray(responseMessage) && responseMessage.length > 0) {
        message = responseMessage[0];
        errors = responseErrors;
      } else if (typeof responseMessage === 'string') {
        message = responseMessage;
        errors = responseErrors;
      }

      if (
        exception instanceof UnauthorizedException &&
        message.toLowerCase().includes('invalid access token')
      ) {
        statusCode = StatusCode.INVALID_ACCESS_TOKEN;
        response.setHeader('instruction', 'logout');
      }

      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(exception.message, exception.stack);
      }
    } else if (exception instanceof TokenExpiredError) {
      status = HttpStatus.UNAUTHORIZED;
      statusCode = StatusCode.INVALID_ACCESS_TOKEN;
      message = 'Token Expired';
      response.setHeader('instruction', 'refresh_token');
    } else {
      this.logger.error(
        (exception as Error).message,
        (exception as Error).stack,
      );
    }

    response.status(status).json({
      statusCode,
      message,
      errors,
      url: request.url,
    });
  }
}
