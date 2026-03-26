// src/features/roles/api/roles.api.ts
// Calls the Next.js BFF at /api/roles (not NestJS directly).
// The BFF handles JWT auth via the session cookie.

import type {
  CreateRoleInput,
  PaginatedRoles,
  Role,
  UpdateRoleInput,
} from "../types/roles.types";

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status.toString()}: ${text}`);
  }
}

export async function fetchRoles(): Promise<PaginatedRoles> {
  const res = await fetch("/api/roles");
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: PaginatedRoles;
  };
  return json.data;
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const res = await fetch("/api/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: Role;
  };
  return json.data;
}

export async function updateRole(
  id: number,
  input: UpdateRoleInput,
): Promise<Role> {
  const res = await fetch(`/api/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await throwIfNotOk(res);
  const json = (await res.json()) as {
    statusCode: number;
    message: string;
    data: Role;
  };
  return json.data;
}

export async function deleteRole(id: number): Promise<void> {
  const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
  if (res.status === 204) return;
  await throwIfNotOk(res);
}
