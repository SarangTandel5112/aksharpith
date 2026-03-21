export interface JwtPayload {
  userId: number;
  email: string;
  username?: string;
  roleId?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
