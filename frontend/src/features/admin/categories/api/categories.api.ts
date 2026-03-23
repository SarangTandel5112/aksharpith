// src/features/admin/categories/api/categories.api.ts
// Calls the Next.js BFF at /api/categories (not NestJS directly).
// The BFF handles JWT auth via the session cookie.

import type {
  Category,
  CreateCategoryInput,
  PaginatedCategories,
  UpdateCategoryInput,
} from "../types/categories.types";

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status.toString()}: ${text}`);
  }
}

export async function fetchCategories(): Promise<PaginatedCategories> {
  const res = await fetch("/api/categories");
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: PaginatedCategories;
  };
  return json.data;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: Category;
  };
  return json.data;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: Category;
  };
  return json.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  if (res.status === 204) return;
  await throwIfNotOk(res);
}
