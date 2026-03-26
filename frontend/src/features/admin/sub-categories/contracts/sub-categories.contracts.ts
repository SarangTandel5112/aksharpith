export type SubCategoryResponseDto = {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  photo: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateSubCategoryDto = {
  name: string;
  categoryId: string;
  description?: string;
  photo?: string;
  sortOrder?: number;
};

export type UpdateSubCategoryDto = {
  name?: string;
  categoryId?: string;
};
