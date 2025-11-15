import { httpService } from './http';
import { Category } from './categories.api';

export interface Product {
    id: number;
    productName: string;
    description: string | null;
    price: number | null;
    stockQuantity: number | null;
    photo: string | null;
    categoryId: number;
    category?: Category;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateProductDto {
    productName: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    photo?: string;
    categoryId: number;
}

export interface UpdateProductDto {
    productName?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    photo?: string;
    categoryId?: number;
}

export interface ProductQueryParams {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

export interface PaginatedProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const productsApi = {
    getAll: async (params?: ProductQueryParams) => {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return httpService.get<PaginatedProductsResponse>(`/products${queryString}`);
    },

    getById: async (id: number) => {
        return httpService.get<Product>(`/products/${id}`);
    },

    getByCategory: async (categoryId: number) => {
        return httpService.get<Product[]>(`/products/category/${categoryId}`);
    },

    create: async (data: CreateProductDto) => {
        return httpService.post<Product>('/products', data);
    },

    update: async (id: number, data: UpdateProductDto) => {
        return httpService.put<Product>(`/products/${id}`, data);
    },

    delete: async (id: number) => {
        return httpService.delete<null>(`/products/${id}`);
    },

    getCount: async () => {
        return httpService.get<{ count: number }>('/products/stats/count');
    },

    getCountByCategory: async (categoryId: number) => {
        return httpService.get<{ count: number }>(`/products/stats/count/category/${categoryId}`);
    }
};
