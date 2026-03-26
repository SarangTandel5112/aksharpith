export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "dropdown";

export type GroupFieldOptionResponseDto = {
  id: string;
  optionLabel: string;
  optionValue: string;
  sortOrder: number;
  isActive: boolean;
};

export type GroupFieldResponseDto = {
  id: string;
  fieldName: string;
  fieldKey: string;
  fieldType: FieldType;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  isActive: boolean;
  options?: GroupFieldOptionResponseDto[];
};

export type ProductGroupResponseDto = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  fields?: GroupFieldResponseDto[];
};

export type CreateGroupFieldOptionDto = {
  optionLabel: string;
  optionValue: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateGroupFieldOptionDto = {
  optionLabel?: string;
  optionValue?: string;
  sortOrder?: number;
};

export type CreateGroupFieldDto = {
  fieldName: string;
  fieldKey?: string;
  fieldType?: FieldType;
  isRequired?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
  options?: CreateGroupFieldOptionDto[];
};

export type AddGroupFieldDto = CreateGroupFieldDto;

export type UpdateGroupFieldDto = {
  fieldName?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
};

export type CreateProductGroupDto = {
  name: string;
  description?: string;
  fields?: CreateGroupFieldDto[];
};

export type UpdateProductGroupDto = {
  name?: string;
  isActive?: boolean;
};
