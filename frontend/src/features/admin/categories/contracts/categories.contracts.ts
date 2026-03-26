export type CategoryResponseDto = {
  id: string;
  name: string;
  description: string | null;
  photo: string | null;
  departmentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateCategoryDto = {
  name: string;
  description?: string;
  photo?: string;
  departmentId?: string;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
