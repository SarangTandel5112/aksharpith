import { httpService } from './http';

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

export interface PaginatedCategoriesResponse {
    data: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const categoriesApi = {
    getAll: async (params?: CategoryQueryParams) => {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return httpService.get<PaginatedCategoriesResponse>(`/categories${queryString}`);
    },

    getById: async (id: number) => {
        return httpService.get<Category>(`/categories/${id}`);
    },

    create: async (data: CreateCategoryDto) => {
        return httpService.post<Category>('/categories', data);
    },

    update: async (id: number, data: UpdateCategoryDto) => {
        return httpService.put<Category>(`/categories/${id}`, data);
    },

    delete: async (id: number) => {
        return httpService.delete<null>(`/categories/${id}`);
    },

    getCount: async () => {
        return httpService.get<{ count: number }>('/categories/stats/count');
    }
};
