// src/__tests__/msw/handlers/users.handlers.ts
// BFF routes are served from the Next.js dev server (localhost:3000).
// In happy-dom tests, relative fetch('/api/users') resolves to http://localhost:3000/api/users.
// MSW must intercept at this BFF base URL — not the NestJS backend (localhost:3001).

import { HttpResponse, http } from "msw";
import type { RequestHandler } from "msw";
import type { User } from "@features/users/types/users.types";

const BFF = "http://localhost:3000";

// ── Default mock data ─────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: { id: "role-1", roleName: "Admin" },
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    role: { id: "role-2", roleName: "Staff" },
    isActive: true,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

export const mockRoles = [
  {
    id: "role-1",
    roleName: "Admin",
    description: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role-2",
    roleName: "Staff",
    description: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// ── Handlers ──────────────────────────────────────────────────────────────────

export const usersHandlers: RequestHandler[] = [
  // GET /api/users → paginated list
  http.get(`${BFF}/api/users`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: "OK",
      data: {
        items: mockUsers,
        total: mockUsers.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    }),
  ),

  // POST /api/users → create user
  http.post(`${BFF}/api/users`, () =>
    HttpResponse.json(
      { statusCode: 201, message: "Created", data: mockUsers[0] },
      { status: 201 },
    ),
  ),

  // PATCH /api/users/:id → update user
  http.patch(`${BFF}/api/users/:id`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: "OK",
      data: mockUsers[0],
    }),
  ),

  // DELETE /api/users/:id → 204 No Content
  http.delete(
    `${BFF}/api/users/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // GET /api/roles → paginated roles list
  http.get(`${BFF}/api/roles`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: "OK",
      data: {
        items: mockRoles,
        total: mockRoles.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    }),
  ),
];
