// All query keys follow the same tenant-scoped pattern:
// [organizationId, storeId, resource, ...specifics]
// This ensures cache isolation between tenants and
// enables precise invalidation on logout.

export const queryKeys = {
  // Add key factories here as features are built.
  // Example:
  //
  // orders: {
  //   all: (orgId: string, storeId: string) =>
  //     [orgId, storeId, 'orders'] as const,
  //   byId: (orgId: string, storeId: string, orderId: string) =>
  //     [orgId, storeId, 'orders', orderId] as const,
  // },
} as const;
