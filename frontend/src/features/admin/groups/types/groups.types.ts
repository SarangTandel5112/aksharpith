import type {
  CreateGroupFieldDto,
  CreateGroupFieldOptionDto,
  CreateProductGroupDto,
  GroupFieldOptionResponseDto,
  GroupFieldResponseDto,
  PaginatedData,
  ProductGroupResponseDto,
  UpdateGroupFieldDto,
  UpdateGroupFieldOptionDto,
  UpdateProductGroupDto,
} from "@shared/contracts";

export type GroupFieldOption = GroupFieldOptionResponseDto;
export type GroupField = GroupFieldResponseDto;
export type ProductGroup = ProductGroupResponseDto;
export type Group = ProductGroup;
export type PaginatedGroups = PaginatedData<Group>;
export type CreateGroupInput = CreateProductGroupDto;
export type UpdateGroupInput = UpdateProductGroupDto;
export type GroupFieldInput = CreateGroupFieldDto;
export type UpdateGroupFieldInput = UpdateGroupFieldDto;
export type GroupFieldOptionInput = CreateGroupFieldOptionDto;
export type UpdateGroupFieldOptionInput = UpdateGroupFieldOptionDto;
