import { z } from 'zod'

export const DepartmentSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  description: z.string(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
})

export const CreateDepartmentSchema = z.object({
  name:        z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
})

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial()

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>
