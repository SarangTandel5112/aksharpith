import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@features/users/contracts/users.contracts";
import type { Role } from "@features/admin/roles/types/roles.types";
import type { PaginatedResponse } from "@shared/types/core";

export type User = Omit<UserResponseDto, "role"> & {
  role?: Role | null;
};
export type PaginatedUsers = PaginatedResponse<User>;
export type CreateUserInput = CreateUserDto;
export type UpdateUserInput = UpdateUserDto;
