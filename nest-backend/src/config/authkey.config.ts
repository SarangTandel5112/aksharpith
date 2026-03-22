import { registerAs } from '@nestjs/config';

export const AuthKeyConfigName = 'authkey';

export interface AuthKeyConfig {
  jwtSecret: string;
  expiresIn: number;
}

export default registerAs(AuthKeyConfigName, () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.EXPIRES_IN ?? '604800', 10),
  };
});
