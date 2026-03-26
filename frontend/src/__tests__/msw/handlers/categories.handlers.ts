// src/__tests__/msw/handlers/categories.handlers.ts

import type { RequestHandler } from "msw";
import { HttpResponse, http } from "msw";

const BASE = "http://localhost:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  categoryName: string;
  name: string;
  description: string | null;
  photo: string | null;
  departmentId: string;
  department: { id: string; departmentName: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Default mock data ─────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    categoryName: "Phones",
    name: "Phones",
    description: "Mobile phones",
    photo: null,
    departmentId: "dept-1",
    department: { id: "dept-1", departmentName: "Electronics", name: "Electronics" },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    categoryName: "Shirts",
    name: "Shirts",
    description: null,
    photo: null,
    departmentId: "dept-2",
    department: { id: "dept-2", departmentName: "Clothing", name: "Clothing" },
    isActive: true,
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
      categoryName: string;
      description?: string;
      photo?: string | null;
      departmentId: string;
      isActive?: boolean;
    };
    const newCategory: Category = {
      id: "cat-new",
      categoryName: body.categoryName,
      name: body.categoryName,
      description: body.description ?? null,
      photo: body.photo ?? null,
      departmentId: body.departmentId,
      department: { id: body.departmentId, departmentName: "Department", name: "Department" },
      isActive: body.isActive ?? true,
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
      categoryName: string;
      description: string;
      photo: string | null;
      departmentId: string;
      isActive: boolean;
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
      data: {
        ...cat,
        ...body,
        name: body.categoryName ?? cat.name,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // DELETE /api/categories/:id → 204 No Content
  http.delete(
    `${BASE}/api/categories/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
