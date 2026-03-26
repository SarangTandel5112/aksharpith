import type {
  CreateRoleDto,
  PaginatedData,
  RoleResponseDto,
  UpdateRoleDto,
} from "@shared/contracts";

export type Role = RoleResponseDto;
export type PaginatedRoles = PaginatedData<Role>;
export type CreateRoleInput = CreateRoleDto;
export type UpdateRoleInput = UpdateRoleDto;
