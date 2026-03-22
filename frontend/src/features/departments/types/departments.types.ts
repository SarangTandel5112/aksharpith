// src/features/departments/types/departments.types.ts

export type Department = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedDepartments = {
  items: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateDepartmentInput = {
  name: string;
  description?: string;
};

export type UpdateDepartmentInput = {
  name?: string;
  description?: string;
};
