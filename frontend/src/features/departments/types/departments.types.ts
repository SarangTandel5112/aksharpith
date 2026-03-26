import type {
  CreateDepartmentDto,
  DepartmentResponseDto,
  PaginatedData,
  UpdateDepartmentDto,
} from "@shared/contracts";

export type Department = DepartmentResponseDto;
export type PaginatedDepartments = PaginatedData<Department>;
export type CreateDepartmentInput = CreateDepartmentDto;
export type UpdateDepartmentInput = UpdateDepartmentDto;
