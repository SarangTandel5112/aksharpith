/**
 * Common type definitions used across repositories
 * Centralizes shared interfaces to follow DRY principle
 */

export interface BaseQueryOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
