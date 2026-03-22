// src/features/auth/schemas/login.schema.ts
import { z } from 'zod'

export const LoginFormSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormValues = z.infer<typeof LoginFormSchema>
