import { createCrudApi } from './api.factory';

export interface Department {
  id: number;
  departmentName: string;
  departmentCode: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDepartmentDto {
  departmentName: string;
  departmentCode?: string;
  description?: string;
  isActive?: boolean;
}

export const departmentsApi = createCrudApi<Department, CreateDepartmentDto, Partial<Department>>('/departments');
