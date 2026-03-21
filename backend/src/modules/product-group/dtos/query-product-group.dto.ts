import { BaseQueryOptions } from '@common/types';

export interface QueryProductGroupDto extends BaseQueryOptions {
  search?: string;
}
