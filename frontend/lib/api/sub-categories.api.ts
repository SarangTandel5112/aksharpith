import { createCrudApi } from './api.factory';

export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;
  description: string | null;
  photo: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  category?: {
    id: number;
    categoryName: string;
  };
}

export interface CreateSubCategoryDto {
  subCategoryName: string;
  categoryId: number;
  description?: string;
  photo?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const subCategoriesApi = createCrudApi<SubCategory, CreateSubCategoryDto, Partial<SubCategory>>('/sub-categories');
