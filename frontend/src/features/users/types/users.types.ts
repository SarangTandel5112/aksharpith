// src/features/users/types/users.types.ts

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { id: string; roleName: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedUsers = {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
};

export type UpdateUserInput = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  roleId?: string | undefined;
};
