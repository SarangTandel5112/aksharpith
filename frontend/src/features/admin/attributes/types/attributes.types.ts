// src/features/admin/attributes/types/attributes.types.ts

export type ProductAttributeValue = {
  id: string;
  attributeId: string;
  value: string;
  code?: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductAttribute = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isRequired?: boolean;
  displayOrder?: number;
  isActive: boolean;
  values: ProductAttributeValue[];
  createdAt: string;
};

// Alias used by AttributesModule and LotMatrixWizard
export type Attribute = ProductAttribute;
