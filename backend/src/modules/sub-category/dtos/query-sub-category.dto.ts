import { BaseQueryOptions } from '@common/types';

export interface QuerySubCategoryDto extends BaseQueryOptions {
  subCategoryName?: string;
  categoryId?: number;
  isActive?: boolean;
}
