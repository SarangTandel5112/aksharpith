import { httpService } from './http';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    Firstname: string;
    Middlename?: string;
    Lastname: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    username: string;
    Firstname: string;
    Middlename?: string | null;
    Lastname: string;
    email: string;
    roleId?: number | null;
    isTempPassword: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
}

export const authApi = {
    login: async (data: LoginDto) => {
        return httpService.post<AuthResponse>('/auth/login', data, { skipUnauthorizedRedirect: true });
    },

    register: async (data: RegisterDto) => {
        return httpService.post<AuthResponse>('/auth/register', data);
    },

    refreshToken: async (data: RefreshTokenDto) => {
        return httpService.post<RefreshTokenResponse>('/auth/refresh-token', data);
    },

    validateToken: async () => {
        return httpService.get<{ user: User }>('/auth/validate');
    },

    logout: async () => {
        return httpService.post<null>('/auth/logout');
    }
};
