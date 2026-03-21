import { registerAs } from '@nestjs/config';

export const AuthKeyConfigName = 'authkey';

export interface AuthKeyConfig {
  jwtSecret: string;
  expiresIn: number;
}

export default registerAs(AuthKeyConfigName, () => ({
  jwtSecret: process.env.JWT_SECRET,
  expiresIn: parseInt(process.env.EXPIRES_IN ?? '604800', 10),
}));
