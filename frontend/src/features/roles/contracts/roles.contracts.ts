export type RoleResponseDto = {
  id: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateRoleDto = {
  roleName: string;
};

export type UpdateRoleDto = Partial<CreateRoleDto>;
