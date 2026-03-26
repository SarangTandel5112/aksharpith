import type {
  CreateRoleDto,
  RoleResponseDto,
  UpdateRoleDto,
} from "@features/roles/contracts/roles.contracts";
import type { PaginatedResponse } from "@shared/types/core";

export type Role = RoleResponseDto & {
  name: RoleResponseDto["roleName"];
};
export type PaginatedRoles = PaginatedResponse<Role>;
export type CreateRoleInput = CreateRoleDto;
export type UpdateRoleInput = UpdateRoleDto;
