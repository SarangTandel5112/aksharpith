import type {
  CreateGroupFieldDto,
  CreateGroupFieldOptionDto,
  CreateProductGroupDto,
  GroupFieldOptionResponseDto,
  GroupFieldResponseDto,
  ProductGroupResponseDto,
  UpdateGroupFieldDto,
  UpdateGroupFieldOptionDto,
  UpdateProductGroupDto,
} from "@features/admin/groups/contracts/groups.contracts";
import type { PaginatedResponse } from "@shared/types/core";

export type GroupFieldOption = Omit<
  GroupFieldOptionResponseDto,
  "optionLabel" | "optionValue"
> & {
  fieldId?: string;
  label: GroupFieldOptionResponseDto["optionLabel"];
  value: GroupFieldOptionResponseDto["optionValue"];
};
export type GroupField = Omit<
  GroupFieldResponseDto,
  "fieldName" | "fieldKey" | "fieldType" | "options"
> & {
  groupId?: string;
  createdAt?: string;
  updatedAt?: string | null;
  name: GroupFieldResponseDto["fieldName"];
  key: GroupFieldResponseDto["fieldKey"];
  type: GroupFieldResponseDto["fieldType"];
  options: GroupFieldOption[];
};
export type ProductGroup = Omit<ProductGroupResponseDto, "fields"> & {
  fields: GroupField[];
};
export type Group = ProductGroup;
export type PaginatedGroups = PaginatedResponse<Group>;
export type CreateGroupInput = CreateProductGroupDto;
export type UpdateGroupInput = UpdateProductGroupDto;
export type GroupFieldInput = CreateGroupFieldDto;
export type UpdateGroupFieldInput = UpdateGroupFieldDto;
export type GroupFieldOptionInput = CreateGroupFieldOptionDto;
export type UpdateGroupFieldOptionInput = UpdateGroupFieldOptionDto;
