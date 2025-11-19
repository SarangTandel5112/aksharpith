import { createCrudApi } from './api.factory';

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

export interface CreateUserDto {
    username: string;
    Firstname: string;
    Middlename?: string;
    Lastname: string;
    email: string;
    password: string;
    roleId?: number;
}

/**
 * Users API
 * Uses generic CRUD factory to reduce code duplication
 */
export const usersApi = createCrudApi<User, CreateUserDto, Partial<User>>('/users');
