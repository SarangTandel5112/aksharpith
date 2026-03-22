import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

const BASE = 'http://localhost:3001'

function fakeProduct() {
  return {
    id:          faker.string.uuid(),
    name:        faker.commerce.productName(),
    sku:         faker.string.alphanumeric(8).toUpperCase(),
    description: faker.commerce.productDescription(),
    basePrice:   faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
    category:    { id: faker.string.uuid(), name: faker.commerce.department() },
    subCategory: null,
    department:  { id: faker.string.uuid(), name: faker.commerce.department() },
    isActive:    true,
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

const FAKE_PRODUCTS = Array.from({ length: 12 }, fakeProduct)

export const catalogHandlers = [
  http.get(`${BASE}/api/products`, ({ request }) => {
    const url   = new URL(request.url)
    const page  = Number(url.searchParams.get('page')  ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 12)
    const items = FAKE_PRODUCTS.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: { items, total: FAKE_PRODUCTS.length, page, limit, totalPages: 1 },
    })
  }),

  http.get(`${BASE}/api/products/:id`, ({ params }) => {
    const product = FAKE_PRODUCTS.find((p) => p.id === params['id']) ?? fakeProduct()
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: product })
  }),

  http.get(`${BASE}/api/categories`, () =>
    HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: {
        items: [
          { id: faker.string.uuid(), name: 'Electronics' },
          { id: faker.string.uuid(), name: 'Clothing' },
          { id: faker.string.uuid(), name: 'Books' },
        ],
        total: 3, page: 1, limit: 100, totalPages: 1,
      },
    }),
  ),

  http.get(`${BASE}/api/departments`, () =>
    HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: {
        items: [
          { id: faker.string.uuid(), name: 'Retail' },
          { id: faker.string.uuid(), name: 'Wholesale' },
        ],
        total: 2, page: 1, limit: 100, totalPages: 1,
      },
    }),
  ),
]
