import { ProductGroupFieldValue } from '@entities/product-group-field-value.entity';

export type GroupFieldValueInput = {
  fieldId: number;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  valueOptionId?: number | null;
};

export interface IProductGroupFieldValueRepository {
  findByProductId(productId: number): Promise<ProductGroupFieldValue[]>;
  deleteByProductId(productId: number): Promise<void>;
  createMany(productId: number, values: GroupFieldValueInput[]): Promise<ProductGroupFieldValue[]>;
}
