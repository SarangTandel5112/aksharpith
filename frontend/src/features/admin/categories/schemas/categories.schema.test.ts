import { describe, expect, it } from 'vitest'
import { CreateCategorySchema } from './categories.schema'
describe('CreateCategorySchema', () => {
  it('accepts valid category', () => {
    expect(CreateCategorySchema.safeParse({ name: 'Clothing', departmentId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateCategorySchema.safeParse({ name: '', departmentId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(false)
  })
  it('rejects invalid departmentId', () => {
    expect(CreateCategorySchema.safeParse({ name: 'Clothing', departmentId: 'not-a-uuid' }).success).toBe(false)
  })
})
