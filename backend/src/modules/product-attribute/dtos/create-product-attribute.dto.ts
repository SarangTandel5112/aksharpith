export type CreateProductAttributeDto = {
  attributeName: string;
  attributeCode: string;
  displayOrder?: number | null;
  isRequired?: boolean;
};
