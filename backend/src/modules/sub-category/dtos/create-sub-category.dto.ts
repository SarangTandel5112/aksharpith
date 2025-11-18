export interface CreateSubCategoryDto {
  subCategoryName: string;
  categoryId: number;
  description?: string;
  photo?: string;
  displayOrder?: number;
  isActive?: boolean;
}
