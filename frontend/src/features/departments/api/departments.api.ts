// src/features/departments/api/departments.api.ts
// Calls the Next.js BFF at /api/departments (not NestJS directly).
// The BFF handles JWT auth via the session cookie.

import type {
  CreateDepartmentInput,
  Department,
  PaginatedDepartments,
  UpdateDepartmentInput,
} from "../types/departments.types";

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status.toString()}: ${text}`);
  }
}

export async function fetchDepartments(): Promise<PaginatedDepartments> {
  const res = await fetch("/api/departments");
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: PaginatedDepartments;
  };
  return json.data;
}

export async function createDepartment(
  input: CreateDepartmentInput,
): Promise<Department> {
  const res = await fetch("/api/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: Department;
  };
  return json.data;
}

export async function updateDepartment(
  id: number,
  input: UpdateDepartmentInput,
): Promise<Department> {
  const res = await fetch(`/api/departments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: Department;
  };
  return json.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
  if (res.status === 204) return;
  await throwIfNotOk(res);
}
