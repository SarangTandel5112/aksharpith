import { WinstonLogger } from '../../setup/winston.logger';
import { ExceptionHandler } from './exception.handler';
import { Test } from '@nestjs/testing';
import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { QueryFailedError } from 'typeorm';
import { StatusCode } from '../http/response';
import { PostgresErrorCode } from '../../utils/constants';

describe('ExceptionHandler', () => {
  let exceptionHandler: ExceptionHandler;

  const mockSetStatus = jest.fn(() => ({ json: mockSetJson }));
  const mockSetJson = jest.fn();
  const mockSetHeader = jest.fn();

  const hostMock: ArgumentsHost = {
    switchToHttp: () =>
      ({
        getResponse: () =>
          ({
            setHeader: mockSetHeader,
            status: mockSetStatus,
          }) as any,
        getRequest: () => ({ url: 'test' }),
      }) as HttpArgumentsHost,
    getArgs: () => ({}) as any,
    getArgByIndex: () => ({}) as any,
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
    getType: () => ({}) as any,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ExceptionHandler,
        { provide: WinstonLogger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    exceptionHandler = module.get(ExceptionHandler);
  });

  it('should set token expired data on TokenExpiredError', () => {
    const exception = new TokenExpiredError('Token is expired', new Date());
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.INVALID_ACCESS_TOKEN,
      message: 'Token Expired',
      url: 'test',
    });

    expect(mockSetHeader).toHaveBeenCalledWith('instruction', 'refresh_token');
    expect(exceptionHandler['logger'].error).not.toHaveBeenCalled();
  });

  it('should set logout instruction data on invalid access token UnauthorizedException', () => {
    const exception = new UnauthorizedException('Invalid Access Token');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.INVALID_ACCESS_TOKEN,
      message: 'Invalid Access Token',
      url: 'test',
    });

    expect(mockSetHeader).toHaveBeenCalledWith('instruction', 'logout');
    expect(exceptionHandler['logger'].error).not.toHaveBeenCalled();
  });

  it('should set bad request data on BadRequestException', () => {
    const exception = new BadRequestException('Bad Request');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Bad Request',
      url: 'test',
    });

    expect(mockSetHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).not.toHaveBeenCalled();
  });

  it('should set internal error data on InternalServerErrorException', () => {
    const exception = new InternalServerErrorException('Something went wrong');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Something went wrong',
      url: 'test',
    });

    expect(mockSetHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).toHaveBeenCalled();
  });

  it('should return a generic message for non-http errors', () => {
    const exception = new Error('Other Error');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Something went wrong',
      url: 'test',
    });

    expect(mockSetHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).toHaveBeenCalled();
  });

  it('maps unique constraint violations to conflict responses', () => {
    const exception = new QueryFailedError(
      'INSERT',
      [],
      { code: PostgresErrorCode.UNIQUE_VIOLATION } as never,
    );

    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Resource already exists',
      url: 'test',
    });
  });

  it('maps foreign key violations to bad request responses', () => {
    const exception = new QueryFailedError(
      'INSERT',
      [],
      { code: PostgresErrorCode.FOREIGN_KEY_VIOLATION } as never,
    );

    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Invalid reference supplied',
      url: 'test',
    });
  });
});
