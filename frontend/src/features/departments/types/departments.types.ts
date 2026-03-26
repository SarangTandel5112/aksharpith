import type {
  CreateDepartmentDto,
  DepartmentResponseDto,
  UpdateDepartmentDto,
} from "@features/departments/contracts/departments.contracts";
import type { PaginatedResponse } from "@shared/types/core";

export type Department = DepartmentResponseDto;
export type PaginatedDepartments = PaginatedResponse<Department>;
export type CreateDepartmentInput = CreateDepartmentDto;
export type UpdateDepartmentInput = UpdateDepartmentDto;
