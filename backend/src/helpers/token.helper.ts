import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '@config/jwt.config';
import { JwtPayload } from '@types';

export class TokenHelper {
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as SignOptions);
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    } as SignOptions);
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
