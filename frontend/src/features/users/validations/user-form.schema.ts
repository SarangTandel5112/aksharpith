import { z } from 'zod'

export const CreateUserFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
  roleId: z.coerce.number().int().min(1, 'Role is required'),
  isActive: z.boolean().default(true),
})

export type CreateUserFormValues = z.infer<typeof CreateUserFormSchema>

export const UpdateUserFormSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  roleId: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateUserFormValues = z.infer<typeof UpdateUserFormSchema>
