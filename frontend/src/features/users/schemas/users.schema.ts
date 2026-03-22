// src/features/users/schemas/users.schema.ts
// BFF-level Zod schemas used by API route handlers to validate request bodies.

import { z } from 'zod'

export const CreateUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  roleId: z.string().min(1),
})

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
})
