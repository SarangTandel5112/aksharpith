// src/features/departments/api/departments.api.ts
// Calls NestJS directly (not the Next.js BFF). Auth is JWT-based on the server.
// NestJS responses are wrapped in { statusCode, message, data }.

import type {
  CreateDepartmentInput,
  Department,
  PaginatedDepartments,
  UpdateDepartmentInput,
} from "../types/departments.types";

const NEST_API = process.env["NEST_API"] ?? "http://localhost:3001";

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status.toString()}: ${text}`);
  }
}

export async function fetchDepartments(): Promise<PaginatedDepartments> {
  const res = await fetch(`${NEST_API}/api/departments`);
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
  const res = await fetch(`${NEST_API}/api/departments`, {
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
  id: string,
  input: UpdateDepartmentInput,
): Promise<Department> {
  const res = await fetch(`${NEST_API}/api/departments/${id}`, {
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

export async function deleteDepartment(id: string): Promise<void> {
  const res = await fetch(`${NEST_API}/api/departments/${id}`, {
    method: "DELETE",
  });
  if (res.status === 204) return;
  await throwIfNotOk(res);
}
