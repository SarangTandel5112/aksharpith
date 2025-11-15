import { Request, Response, NextFunction } from 'express';
import { TokenHelper } from '@helpers/token.helper';
import { ResponseHelper } from '@common/response.helper';
import { AuthenticatedRequest } from '@types';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseHelper.unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = TokenHelper.verifyToken(token);
    (req as AuthenticatedRequest).user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    ResponseHelper.unauthorized(res, 'Invalid or expired token');
  }
};
