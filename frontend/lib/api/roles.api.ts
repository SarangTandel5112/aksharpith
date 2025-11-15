import { httpService } from './http';

export interface Role {
    id: number;
    roleName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const rolesApi = {
    getAll: async () => {
        return httpService.get<Role[]>('/roles');
    },

    getById: async (id: number) => {
        return httpService.get<Role>(`/roles/${id}`);
    }
};
