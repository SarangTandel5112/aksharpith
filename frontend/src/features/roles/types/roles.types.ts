// src/features/roles/types/roles.types.ts

export type Role = {
  id: string
  roleName: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type PaginatedRoles = {
  items: Role[]
  total: number
  page: number
  limit: number
  totalPages: number
}
