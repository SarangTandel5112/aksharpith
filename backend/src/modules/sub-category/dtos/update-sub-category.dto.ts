export interface UpdateSubCategoryDto {
  subCategoryName?: string;
  categoryId?: number;
  description?: string;
  photo?: string;
  displayOrder?: number;
  isActive?: boolean;
}
