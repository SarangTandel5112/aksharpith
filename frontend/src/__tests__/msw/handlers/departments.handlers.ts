// src/__tests__/msw/handlers/departments.handlers.ts
import { HttpResponse, http } from 'msw'
import type { RequestHandler } from 'msw'

const BASE = 'http://localhost:3001'

// ── Types ─────────────────────────────────────────────────────────────────────

type Department = {
  id:          string
  name:        string
  description: string | null
  createdAt:   string
  updatedAt:   string
}

// ── Default mock data ─────────────────────────────────────────────────────────

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id:          'dept-1',
    name:        'Electronics',
    description: 'Electronic products',
    createdAt:   '2024-01-01T00:00:00Z',
    updatedAt:   '2024-01-01T00:00:00Z',
  },
  {
    id:          'dept-2',
    name:        'Clothing',
    description: 'Apparel and clothing',
    createdAt:   '2024-01-01T00:00:00Z',
    updatedAt:   '2024-01-01T00:00:00Z',
  },
]

// ── Handlers ──────────────────────────────────────────────────────────────────

export const departmentsHandlers: RequestHandler[] = [
  // GET /api/departments → paginated list
  http.get(`${BASE}/api/departments`, () =>
    HttpResponse.json({
      statusCode: 200,
      message:    'OK',
      data: {
        items:      DEFAULT_DEPARTMENTS,
        total:      DEFAULT_DEPARTMENTS.length,
        page:       1,
        limit:      20,
        totalPages: 1,
      },
    }),
  ),

  // POST /api/departments → create department
  http.post(`${BASE}/api/departments`, async ({ request }) => {
    const body = await request.json() as { name: string; description?: string }
    const newDept: Department = {
      id:          'dept-new',
      name:        body.name,
      description: body.description ?? null,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    return HttpResponse.json(
      { statusCode: 201, message: 'Department created', data: newDept },
      { status: 201 },
    )
  }),

  // PATCH /api/departments/:id → update department
  http.patch(`${BASE}/api/departments/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<{ name: string; description: string }>
    const dept = DEFAULT_DEPARTMENTS.find((d) => d.id === params['id'])
    if (!dept) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Department not found', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      statusCode: 200,
      message:    'Department updated',
      data:       { ...dept, ...body, updatedAt: new Date().toISOString() },
    })
  }),

  // DELETE /api/departments/:id → 204 No Content
  http.delete(`${BASE}/api/departments/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),
]
