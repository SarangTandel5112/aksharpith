import type {
  CreateSubCategoryDto,
  SubCategoryResponseDto,
  UpdateSubCategoryDto,
} from "@features/admin/sub-categories/contracts/sub-categories.contracts";
import type { CategoryResponseDto as CategoryDto } from "@features/admin/categories/contracts/categories.contracts";
import type { PaginatedResponse } from "@shared/types/core";

export type SubCategory = SubCategoryResponseDto & {
  category?: Pick<CategoryDto, "id" | "name"> | null;
};
export type PaginatedSubCategories = PaginatedResponse<SubCategory>;
export type CreateSubCategoryInput = CreateSubCategoryDto;
export type UpdateSubCategoryInput = UpdateSubCategoryDto;
