import { httpService } from './http';

export interface UserRole {
    id: number;
    roleName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: number;
    username: string;
    Firstname: string;
    Middlename?: string;
    Lastname: string;
    email: string;
    isTempPassword: boolean;
    roleId: number;
    createdAt: string;
    updatedAt: string;
    role?: UserRole;
}

export interface UserQueryParams {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

export interface PaginatedUsersResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateUserDto {
    username: string;
    Firstname: string;
    Middlename?: string;
    Lastname: string;
    email: string;
    password: string;
    roleId?: number;
}

export const usersApi = {
    getAll: async (params?: UserQueryParams) => {
        // Filter out undefined values
        const filteredParams: any = {};
        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (value !== undefined && value !== null && value !== '') {
                    filteredParams[key] = value;
                }
            });
        }
        const queryString = Object.keys(filteredParams).length > 0
            ? '?' + new URLSearchParams(filteredParams).toString()
            : '';
        return httpService.get<PaginatedUsersResponse>(`/users${queryString}`);
    },

    getById: async (id: number) => {
        return httpService.get<User>(`/users/${id}`);
    },

    create: async (data: CreateUserDto) => {
        return httpService.post<User>('/users', data);
    },

    update: async (id: number, data: Partial<User>) => {
        return httpService.put<User>(`/users/${id}`, data);
    },

    delete: async (id: number) => {
        return httpService.delete(`/users/${id}`);
    },

    getCount: async () => {
        return httpService.get<{ count: number }>('/users/stats/count');
    }
};
