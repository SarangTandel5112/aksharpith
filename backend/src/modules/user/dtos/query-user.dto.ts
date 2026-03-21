import { BaseQueryOptions } from '@common/types';

export interface QueryUserDto extends BaseQueryOptions {
  roleId?: number;
  isActive?: boolean;
}
