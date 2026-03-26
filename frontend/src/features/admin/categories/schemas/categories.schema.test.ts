import { describe, expect, it } from 'vitest'
import { CreateCategorySchema } from './categories.schema'
describe('CreateCategorySchema', () => {
  it('accepts valid category', () => {
    expect(CreateCategorySchema.safeParse({ name: 'Clothing', departmentId: 'dept-1' }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateCategorySchema.safeParse({ name: '', departmentId: 'dept-1' }).success).toBe(false)
  })
  it('rejects invalid departmentId', () => {
    expect(CreateCategorySchema.safeParse({ name: 'Clothing', departmentId: '' }).success).toBe(false)
  })
})
