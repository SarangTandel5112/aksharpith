import type {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@features/admin/categories/contracts/categories.contracts";
import type { DepartmentResponseDto } from "@features/departments/contracts/departments.contracts";
import type { PaginatedResponse } from "@shared/types/core";

export type Category = CategoryResponseDto & {
  department?: Pick<DepartmentResponseDto, "id" | "name"> | null;
};
export type PaginatedCategories = PaginatedResponse<Category>;
export type CreateCategoryInput = CreateCategoryDto;
export type UpdateCategoryInput = UpdateCategoryDto;
