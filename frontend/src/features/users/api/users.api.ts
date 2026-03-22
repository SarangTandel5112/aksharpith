// src/features/users/api/users.api.ts
// Calls the Next.js BFF at /api/users (not NestJS directly).
// The BFF handles JWT auth via the session cookie.

import type {
  CreateUserInput,
  PaginatedUsers,
  UpdateUserInput,
  User,
} from '../types/users.types'

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status.toString()}: ${text}`)
  }
}

export async function fetchUsers(): Promise<PaginatedUsers> {
  const res = await fetch('/api/users')
  await throwIfNotOk(res)
  const json = (await res.json()) as {
    statusCode: number
    message: string
    data: PaginatedUsers
  }
  return json.data
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  await throwIfNotOk(res)
  const json = (await res.json()) as {
    statusCode: number
    message: string
    data: User
  }
  return json.data
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  await throwIfNotOk(res)
  const json = (await res.json()) as {
    statusCode: number
    message: string
    data: User
  }
  return json.data
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
  if (res.status === 204) return
  await throwIfNotOk(res)
}
