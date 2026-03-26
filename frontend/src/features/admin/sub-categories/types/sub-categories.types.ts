import type {
  CreateSubCategoryDto,
  PaginatedData,
  SubCategoryResponseDto,
  UpdateSubCategoryDto,
} from "@shared/contracts";

export type SubCategory = SubCategoryResponseDto;
export type PaginatedSubCategories = PaginatedData<SubCategory>;
export type CreateSubCategoryInput = CreateSubCategoryDto;
export type UpdateSubCategoryInput = UpdateSubCategoryDto;
