import { httpService, ApiResponse } from './http';
import { buildQueryString } from './utils';

/**
 * Generic CRUD API operations interface
 */
export interface CrudApiOperations<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  getAll: (params?: any) => Promise<ApiResponse<PaginatedResponse<T>>>;
  getById: (id: number) => Promise<ApiResponse<T>>;
  create: (data: CreateDto) => Promise<ApiResponse<T>>;
  update: (id: number, data: UpdateDto) => Promise<ApiResponse<T>>;
  delete: (id: number) => Promise<ApiResponse<null>>;
  getCount?: () => Promise<ApiResponse<{ count: number }>>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic API Factory
 * Creates standardized CRUD API operations for any entity
 * Follows DRY principle by eliminating duplicate API code
 *
 * @param basePath - The base API path (e.g., '/users', '/categories')
 * @returns CRUD API operations for the entity
 */
export function createCrudApi<T, CreateDto = Partial<T>, UpdateDto = Partial<T>>(
  basePath: string
): CrudApiOperations<T, CreateDto, UpdateDto> {
  return {
    getAll: async (params?: any) => {
      const queryString = buildQueryString(params);
      return httpService.get<PaginatedResponse<T>>(`${basePath}${queryString}`);
    },

    getById: async (id: number) => {
      return httpService.get<T>(`${basePath}/${id}`);
    },

    create: async (data: CreateDto) => {
      return httpService.post<T>(basePath, data);
    },

    update: async (id: number, data: UpdateDto) => {
      return httpService.put<T>(`${basePath}/${id}`, data);
    },

    delete: async (id: number) => {
      return httpService.delete<null>(`${basePath}/${id}`);
    },

    getCount: async () => {
      return httpService.get<{ count: number }>(`${basePath}/stats/count`);
    }
  };
}
