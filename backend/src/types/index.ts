export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

