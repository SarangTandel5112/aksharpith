// src/features/roles/schemas/roles.schema.ts
// Zod schemas for BFF route body validation.

import { z } from 'zod'

export const CreateRoleSchema = z.object({
  roleName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const UpdateRoleSchema = z.object({
  roleName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})
