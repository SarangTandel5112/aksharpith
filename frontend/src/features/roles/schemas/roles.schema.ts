import { z } from 'zod'

export const CreateRoleSchema = z.object({
  roleName: z.string().min(1).max(100),
})

export const UpdateRoleSchema = z.object({
  roleName: z.string().min(1).max(100).optional(),
})
