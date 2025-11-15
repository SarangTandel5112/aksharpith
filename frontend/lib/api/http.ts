import { apiConfig } from './config';
import { ValidationError } from './errors';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
}

class HttpService {
    private getAuthToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private clearAuthToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
        }
    }

    private handleUnauthorized(): void {
        this.clearAuthToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    }

    private async request<T>(endpoint: string, options: RequestInit & { skipUnauthorizedRedirect?: boolean } = {}): Promise<ApiResponse<T>> {
        const { skipUnauthorizedRedirect, ...fetchOptions } = options;
        const token = this.getAuthToken();
        const headers: Record<string, string> = {
            ...apiConfig.headers,
            ...(fetchOptions.headers as Record<string, string>)
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${apiConfig.baseURL}${endpoint}`, {
                ...fetchOptions,
                headers
            });

            const data = await response.json();

            // Handle 401 Unauthorized - but skip redirect for login endpoint
            if (response.status === 401) {
                if (!skipUnauthorizedRedirect) {
                    this.handleUnauthorized();
                }
                throw new Error(data.message || 'Unauthorized - Please login again');
            }

            if (!response.ok) {
                // Handle validation errors (400 status with errors object)
                if (response.status === 400 && data.errors) {
                    throw new ValidationError(data.message || 'Validation failed', data.errors);
                }
                throw new Error(data.message || 'An error occurred');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred');
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, data?: unknown, options?: RequestInit & { skipUnauthorizedRedirect?: boolean }): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const httpService = new HttpService();
