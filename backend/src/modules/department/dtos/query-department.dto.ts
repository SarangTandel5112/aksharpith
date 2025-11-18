import { BaseQueryOptions } from '@common/types';

export interface QueryDepartmentDto extends BaseQueryOptions {
  departmentName?: string;
  departmentCode?: string;
  isActive?: boolean;
}
