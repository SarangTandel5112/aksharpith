// src/shared/types/core.ts

// NestJS response envelope — all NestJS endpoints wrap responses in this shape
export type ApiResponse<T> = {
  statusCode: number
  message: string
  data: T
}

// NestJS pagination shape — matches PaginatedResponseDto in nest-backend
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Session user — shape returned by GET /api/users/me, stored in next-auth JWT
export type SessionUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: { id: string; roleName: string }
}

// Generic result type — used by services that can fail
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
