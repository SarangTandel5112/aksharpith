import { describe, expect, it } from 'vitest'
import { CreateCategorySchema } from './categories.schema'
describe('CreateCategorySchema', () => {
  it('accepts valid category', () => {
    expect(CreateCategorySchema.safeParse({ categoryName: 'Clothing', departmentId: '550e8400-e29b-41d4-a716-446655440000', isActive: true }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateCategorySchema.safeParse({ categoryName: '', departmentId: '550e8400-e29b-41d4-a716-446655440000', isActive: true }).success).toBe(false)
  })
  it('rejects invalid departmentId', () => {
    expect(CreateCategorySchema.safeParse({ categoryName: 'Clothing', departmentId: 'not-a-uuid', isActive: true }).success).toBe(false)
  })
})
