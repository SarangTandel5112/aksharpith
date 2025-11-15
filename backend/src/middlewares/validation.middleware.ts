import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ResponseHelper } from '@common/response.helper';

export const validationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors: ValidationError[] = await validate(dto);

    if (errors.length > 0) {
      const formattedErrors: Record<string, string[]> = {};
      errors.forEach((error) => {
        if (error.constraints) {
          formattedErrors[error.property] = Object.values(error.constraints);
        }
      });

      ResponseHelper.validationError(res, formattedErrors);
      return;
    }

    // Attach validated DTO to request
    req.body = dto;
    next();
  };
};

