// src/features/roles/api/roles.api.ts
// Calls the Next.js BFF at /api/roles (not NestJS directly).
// The BFF handles JWT auth via the session cookie.

import type { PaginatedRoles } from '../types/roles.types'

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status.toString()}: ${text}`)
  }
}

export async function fetchRoles(): Promise<PaginatedRoles> {
  const res = await fetch('/api/roles')
  await throwIfNotOk(res)
  const json = (await res.json()) as {
    statusCode: number
    message: string
    data: PaginatedRoles
  }
  return json.data
}
