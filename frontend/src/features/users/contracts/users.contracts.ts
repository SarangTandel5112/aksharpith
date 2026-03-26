import type { RoleResponseDto } from "@features/roles/contracts/roles.contracts";

export type UserResponseDto = {
  id: string;
  username: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  roleId: string;
  role?: RoleResponseDto | null;
  isTempPassword: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateUserDto = {
  username?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
  isTempPassword?: boolean;
};

export type UpdateUserDto = Partial<Omit<CreateUserDto, "password">>;
