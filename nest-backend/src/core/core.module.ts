import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseTransformer } from './interceptors/response.transformer';
import { ExceptionHandler } from './interceptors/exception.handler';
import { ConfigModule } from '@nestjs/config';
import { WinstonLogger } from '../setup/winston.logger';

@Module({
  imports: [ConfigModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformer },
    { provide: APP_FILTER, useClass: ExceptionHandler },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    WinstonLogger,
  ],
})
export class CoreModule {}
