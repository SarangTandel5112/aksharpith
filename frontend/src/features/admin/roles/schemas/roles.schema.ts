import { z } from 'zod'

export const RoleSchema = z.object({
  id:          z.string(),
  roleName:    z.string(),
  description: z.string(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
})

export const CreateRoleSchema = z.object({
  roleName:    z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
})

export const UpdateRoleSchema = CreateRoleSchema.partial()

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
