// src/features/auth/schemas/login.schema.test.ts
import { describe, expect, it } from 'vitest'
import { LoginFormSchema } from './login.schema'

describe('LoginFormSchema', () => {
  it('accepts valid credentials', () => {
    const result = LoginFormSchema.safeParse({
      email:    'admin@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty email', () => {
    const result = LoginFormSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = LoginFormSchema.safeParse({ email: 'notanemail', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = LoginFormSchema.safeParse({ email: 'a@b.com', password: '12345' })
    expect(result.success).toBe(false)
  })
})
