import type {
  CreateUserDto,
  PaginatedData,
  RoleResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from "@shared/contracts";

export type User = UserResponseDto;
export type PaginatedUsers = PaginatedData<User>;
export type CreateUserInput = CreateUserDto;
export type UpdateUserInput = UpdateUserDto;
export type UserRole = Pick<RoleResponseDto, "id" | "name" | "isActive">;
