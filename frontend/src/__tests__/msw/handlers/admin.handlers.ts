// src/__tests__/msw/handlers/admin.handlers.ts
import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'
import type { RequestHandler } from 'msw'

const BASE = 'http://localhost:3001'

// ── Roles ─────────────────────────────────────────────────────────────────────

function fakeRole() {
  return {
    id:          faker.string.uuid(),
    roleName:    faker.helpers.arrayElement(['Admin', 'Staff', 'Viewer']),
    description: faker.lorem.sentence(),
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

// ── Departments ───────────────────────────────────────────────────────────────

function fakeDepartment() {
  return {
    id:          faker.string.uuid(),
    name:        faker.commerce.department(),
    description: faker.lorem.sentence(),
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

// ── Categories ────────────────────────────────────────────────────────────────

function fakeCategory() {
  return {
    id:           faker.string.uuid(),
    name:         faker.commerce.productAdjective(),
    description:  faker.lorem.sentence(),
    departmentId: faker.string.uuid(),
    createdAt:    faker.date.past().toISOString(),
    updatedAt:    faker.date.recent().toISOString(),
  }
}

// ── Sub-Categories ────────────────────────────────────────────────────────────

function fakeSubCategory() {
  return {
    id:         faker.string.uuid(),
    name:       faker.commerce.productMaterial(),
    description: faker.lorem.sentence(),
    categoryId: faker.string.uuid(),
    createdAt:  faker.date.past().toISOString(),
    updatedAt:  faker.date.recent().toISOString(),
  }
}

// ── Groups ────────────────────────────────────────────────────────────────────

function fakeGroup() {
  return {
    id:          faker.string.uuid(),
    name:        faker.commerce.productName(),
    description: faker.lorem.sentence(),
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

// ── Attributes ────────────────────────────────────────────────────────────────

function fakeAttribute() {
  return {
    id:          faker.string.uuid(),
    name:        faker.commerce.productAdjective(),
    values:      [faker.commerce.productMaterial(), faker.commerce.productMaterial()],
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────

function fakeUser() {
  return {
    id:        faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    email:     faker.internet.email(),
    role:      { id: faker.string.uuid(), roleName: 'Staff' },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

function fakeProduct() {
  return {
    id:            faker.string.uuid(),
    name:          faker.commerce.productName(),
    description:   faker.commerce.productDescription(),
    sku:           faker.string.alphanumeric(8).toUpperCase(),
    price:         faker.number.int({ min: 100, max: 100000 }),
    categoryId:    faker.string.uuid(),
    subCategoryId: faker.string.uuid(),
    departmentId:  faker.string.uuid(),
    createdAt:     faker.date.past().toISOString(),
    updatedAt:     faker.date.recent().toISOString(),
  }
}

// ── Variants ──────────────────────────────────────────────────────────────────

function fakeVariant() {
  return {
    id:         faker.string.uuid(),
    productId:  faker.string.uuid(),
    sku:        faker.string.alphanumeric(10).toUpperCase(),
    price:      faker.number.int({ min: 100, max: 100000 }),
    attributes: [{ attributeId: faker.string.uuid(), value: faker.commerce.productMaterial() }],
    createdAt:  faker.date.past().toISOString(),
    updatedAt:  faker.date.recent().toISOString(),
  }
}

function paginatedResponse<T>(items: T[]) {
  return { statusCode: 200, message: 'OK', data: { items, total: items.length, page: 1, limit: 20, totalPages: 1 } }
}

export const adminHandlers: RequestHandler[] = [
  // ── Roles ──────────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/roles`, () => HttpResponse.json(paginatedResponse([fakeRole(), fakeRole()]))),
  http.post(`${BASE}/api/roles`, async ({ request }) => {
    const body = await request.json() as { roleName: string }
    return HttpResponse.json({ statusCode: 201, message: 'Role created', data: { ...fakeRole(), roleName: body.roleName } }, { status: 201 })
  }),
  http.get(`${BASE}/api/roles/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeRole(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/roles/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ roleName: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Role updated', data: { ...fakeRole(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/roles/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Role deleted', data: null }),
  ),

  // ── Departments ────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/departments`, () => HttpResponse.json(paginatedResponse([fakeDepartment(), fakeDepartment()]))),
  http.post(`${BASE}/api/departments`, async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ statusCode: 201, message: 'Department created', data: { ...fakeDepartment(), name: body.name } }, { status: 201 })
  }),
  http.get(`${BASE}/api/departments/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeDepartment(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/departments/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ name: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Department updated', data: { ...fakeDepartment(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/departments/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Department deleted', data: null }),
  ),

  // ── Categories ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/categories`, () => HttpResponse.json(paginatedResponse([fakeCategory(), fakeCategory()]))),
  http.post(`${BASE}/api/categories`, async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ statusCode: 201, message: 'Category created', data: { ...fakeCategory(), name: body.name } }, { status: 201 })
  }),
  http.get(`${BASE}/api/categories/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeCategory(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/categories/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ name: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Category updated', data: { ...fakeCategory(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/categories/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Category deleted', data: null }),
  ),

  // ── Sub-Categories ─────────────────────────────────────────────────────────
  http.get(`${BASE}/api/sub-categories`, () => HttpResponse.json(paginatedResponse([fakeSubCategory(), fakeSubCategory()]))),
  http.post(`${BASE}/api/sub-categories`, async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ statusCode: 201, message: 'SubCategory created', data: { ...fakeSubCategory(), name: body.name } }, { status: 201 })
  }),
  http.get(`${BASE}/api/sub-categories/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeSubCategory(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/sub-categories/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ name: string }>
    return HttpResponse.json({ statusCode: 200, message: 'SubCategory updated', data: { ...fakeSubCategory(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/sub-categories/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'SubCategory deleted', data: null }),
  ),

  // ── Groups ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/groups`, () => HttpResponse.json(paginatedResponse([fakeGroup(), fakeGroup()]))),
  http.post(`${BASE}/api/groups`, async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ statusCode: 201, message: 'Group created', data: { ...fakeGroup(), name: body.name } }, { status: 201 })
  }),
  http.get(`${BASE}/api/groups/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeGroup(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/groups/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ name: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Group updated', data: { ...fakeGroup(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/groups/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Group deleted', data: null }),
  ),

  // ── Attributes ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/attributes`, () => HttpResponse.json(paginatedResponse([fakeAttribute(), fakeAttribute()]))),
  http.post(`${BASE}/api/attributes`, async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ statusCode: 201, message: 'Attribute created', data: { ...fakeAttribute(), name: body.name } }, { status: 201 })
  }),
  http.get(`${BASE}/api/attributes/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeAttribute(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/attributes/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ name: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Attribute updated', data: { ...fakeAttribute(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/attributes/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Attribute deleted', data: null }),
  ),

  // ── Users ──────────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/users`, () => HttpResponse.json(paginatedResponse([fakeUser(), fakeUser()]))),
  http.post(`${BASE}/api/users`, async ({ request }) => {
    const body = await request.json() as { firstName: string; lastName: string; email: string }
    return HttpResponse.json({ statusCode: 201, message: 'User created', data: { ...fakeUser(), ...body } }, { status: 201 })
  }),
  http.get(`${BASE}/api/users/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeUser(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/users/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ firstName: string }>
    return HttpResponse.json({ statusCode: 200, message: 'User updated', data: { ...fakeUser(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/users/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'User deleted', data: null }),
  ),

  // ── Products ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/products`, () => HttpResponse.json(paginatedResponse([fakeProduct(), fakeProduct()]))),
  http.post(`${BASE}/api/products`, async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ statusCode: 201, message: 'Product created', data: { ...fakeProduct(), name: body.name } }, { status: 201 })
  }),
  http.get(`${BASE}/api/products/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeProduct(), id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/products/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ name: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Product updated', data: { ...fakeProduct(), id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/products/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Product deleted', data: null }),
  ),

  // ── Variants ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/products/:productId/variants`, ({ params }) =>
    HttpResponse.json(paginatedResponse([{ ...fakeVariant(), productId: params['productId'] as string }])),
  ),
  http.post(`${BASE}/api/products/:productId/variants`, async ({ request, params }) => {
    const body = await request.json() as { sku: string }
    return HttpResponse.json({ statusCode: 201, message: 'Variant created', data: { ...fakeVariant(), productId: params['productId'] as string, sku: body.sku } }, { status: 201 })
  }),
  http.get(`${BASE}/api/products/:productId/variants/:id`, ({ params }) =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...fakeVariant(), productId: params['productId'] as string, id: params['id'] as string } }),
  ),
  http.patch(`${BASE}/api/products/:productId/variants/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ sku: string }>
    return HttpResponse.json({ statusCode: 200, message: 'Variant updated', data: { ...fakeVariant(), productId: params['productId'] as string, id: params['id'] as string, ...body } })
  }),
  http.delete(`${BASE}/api/products/:productId/variants/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Variant deleted', data: null }),
  ),
]
