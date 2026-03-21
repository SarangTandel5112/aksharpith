// Test fixture factories — add as feature types are built.
// Example pattern to follow when adding:
//
// import { faker } from '@faker-js/faker'
// import type { TenantContext } from '@shared/types/core'
//
// export function makeTenantContext(overrides?: Partial<TenantContext>): TenantContext {
//   return {
//     organizationId: faker.string.uuid(),
//     storeId:        faker.string.uuid(),
//     terminalId:     faker.string.uuid(),
//     userId:         faker.string.uuid(),
//     ...overrides,
//   }
// }

export {};
