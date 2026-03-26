import type {
  CategoryResponseDto,
  CreateCategoryDto,
  PaginatedData,
  UpdateCategoryDto,
} from "@shared/contracts";

export type Category = CategoryResponseDto;
export type PaginatedCategories = PaginatedData<Category>;
export type CreateCategoryInput = CreateCategoryDto;
export type UpdateCategoryInput = UpdateCategoryDto;
