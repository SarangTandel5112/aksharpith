// src/__tests__/msw/handlers/categories.handlers.ts

import type { RequestHandler } from "msw";
import { HttpResponse, http } from "msw";

const BASE = "http://localhost:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  description: string | null;
  department: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

// ── Default mock data ─────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Phones",
    description: "Mobile phones",
    department: { id: "dept-1", name: "Electronics" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Shirts",
    description: null,
    department: { id: "dept-2", name: "Clothing" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// ── Handlers ──────────────────────────────────────────────────────────────────

export const categoriesHandlers: RequestHandler[] = [
  // GET /api/categories → paginated list
  http.get(`${BASE}/api/categories`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: "OK",
      data: {
        items: DEFAULT_CATEGORIES,
        total: DEFAULT_CATEGORIES.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    }),
  ),

  // POST /api/categories → create category
  http.post(`${BASE}/api/categories`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      departmentId: string;
    };
    const newCategory: Category = {
      id: "cat-new",
      name: body.name,
      description: body.description ?? null,
      department: { id: body.departmentId, name: "Department" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(
      { statusCode: 201, message: "Category created", data: newCategory },
      { status: 201 },
    );
  }),

  // PATCH /api/categories/:id → update category
  http.patch(`${BASE}/api/categories/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<{
      name: string;
      description: string;
      departmentId: string;
    }>;
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === params["id"]);
    if (!cat) {
      return HttpResponse.json(
        { statusCode: 404, message: "Category not found", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      statusCode: 200,
      message: "Category updated",
      data: { ...cat, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  // DELETE /api/categories/:id → 204 No Content
  http.delete(
    `${BASE}/api/categories/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
