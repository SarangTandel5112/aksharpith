// src/features/admin/groups/types/groups.types.ts

export type GroupFieldOption = {
  id: string;
  fieldId: string;
  optionLabel: string;
  optionValue: string;
  sortOrder: number;
};

export type GroupField = {
  id: string;
  groupId: string;
  fieldName: string;
  fieldKey?: string;
  fieldType: "text" | "textarea" | "number" | "boolean" | "dropdown";
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  options: GroupFieldOption[];
};

export type ProductGroup = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  fields: GroupField[];
  createdAt: string;
};

// Alias used by GroupsModule
export type Group = ProductGroup;
