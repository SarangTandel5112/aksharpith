// src/features/users/validations/user-form.schema.ts

import { z } from 'zod'

export const CreateUserFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
  roleId: z.string().min(1, 'Role is required'),
})

export type CreateUserFormValues = z.infer<typeof CreateUserFormSchema>

export const UpdateUserFormSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
})

export type UpdateUserFormValues = z.infer<typeof UpdateUserFormSchema>
