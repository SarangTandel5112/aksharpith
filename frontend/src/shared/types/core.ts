export type TenantContext = {
  organizationId: string;
  storeId: string;
  terminalId: string;
  userId: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
