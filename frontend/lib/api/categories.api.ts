import { createCrudApi } from './api.factory';

export interface Category {
    id: number;
    categoryName: string;
    description: string | null;
    photo: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateCategoryDto {
    categoryName: string;
    description?: string;
    photo?: string;
}

export interface UpdateCategoryDto {
    categoryName?: string;
    description?: string;
    photo?: string;
}

export interface CategoryQueryParams {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

/**
 * Categories API
 * Uses generic CRUD factory to reduce code duplication
 */
export const categoriesApi = createCrudApi<Category, CreateCategoryDto, UpdateCategoryDto>('/categories');
