// src/features/admin/categories/types/categories.types.ts

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  photo?: string;
  department?: { id: string; name: string };
  departmentId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type PaginatedCategories = {
  items: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
  departmentId?: string;
  photo?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
