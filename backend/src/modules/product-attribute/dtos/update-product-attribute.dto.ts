export type UpdateProductAttributeDto = {
  attributeName?: string;
  attributeCode?: string;
  displayOrder?: number | null;
  isRequired?: boolean;
};
