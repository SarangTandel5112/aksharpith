// src/features/admin/sub-categories/types/sub-categories.types.ts

export type SubCategory = {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  category: { id: string; name: string };
  description?: string;
  photo?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
};
