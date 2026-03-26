import { z } from 'zod'

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  firstName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  roleId: z.coerce.number().int().min(1),
  isActive: z.boolean().optional(),
})

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  roleId: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})
