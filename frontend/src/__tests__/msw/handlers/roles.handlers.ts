// src/__tests__/msw/handlers/roles.handlers.ts
// BFF routes served from Next.js dev server (localhost:3000).
// In happy-dom tests, relative fetch('/api/roles') resolves to http://localhost:3000/api/roles.

import { HttpResponse, http } from 'msw'
import type { RequestHandler } from 'msw'
import type { Role } from '@features/roles/types/roles.types'

const BFF = 'http://localhost:3000'

// ── Default mock data ─────────────────────────────────────────────────────────

export const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Staff',
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

// ── Handlers ──────────────────────────────────────────────────────────────────

export const rolesHandlers: RequestHandler[] = [
  // GET /api/roles → paginated list
  http.get(`${BFF}/api/roles`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        items: mockRoles,
        total: mockRoles.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    }),
  ),

  // POST /api/roles → create role
  http.post(`${BFF}/api/roles`, () =>
    HttpResponse.json(
      { statusCode: 201, message: 'Created', data: mockRoles[0] },
      { status: 201 },
    ),
  ),

  // PATCH /api/roles/:id → update role
  http.patch(`${BFF}/api/roles/:id`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: mockRoles[0],
    }),
  ),

  // DELETE /api/roles/:id → 204 No Content
  http.delete(
    `${BFF}/api/roles/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
]
