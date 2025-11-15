export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const authUtils = {
    setToken: (token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
        }
    },

    setRefreshToken: (refreshToken: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    getToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(AUTH_TOKEN_KEY);
        }
        return null;
    },

    getRefreshToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(REFRESH_TOKEN_KEY);
        }
        return null;
    },

    clearTokens: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    },

    isAuthenticated: (): boolean => {
        return authUtils.getToken() !== null;
    },

    logout: () => {
        authUtils.clearTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    }
};
