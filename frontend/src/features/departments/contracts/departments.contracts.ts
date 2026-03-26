export type DepartmentResponseDto = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateDepartmentDto = {
  name: string;
  code?: string;
  description?: string;
};

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
