import { describe, expect, it } from 'vitest'
import { CreateUserSchema } from './users.schema'
describe('CreateUserSchema', () => {
  it('accepts valid user', () => {
    expect(CreateUserSchema.safeParse({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password123', roleId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true)
  })
  it('rejects invalid email', () => {
    expect(CreateUserSchema.safeParse({ firstName: 'John', lastName: 'Doe', email: 'bad', password: 'password123', roleId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(false)
  })
  it('rejects short password', () => {
    expect(CreateUserSchema.safeParse({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'short', roleId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(false)
  })
})
