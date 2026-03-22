import { describe, expect, it } from 'vitest'
import { CreateSubCategorySchema } from './sub-categories.schema'
describe('CreateSubCategorySchema', () => {
  it('accepts valid sub-category', () => {
    expect(CreateSubCategorySchema.safeParse({ name: 'T-Shirts', categoryId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateSubCategorySchema.safeParse({ name: '', categoryId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(false)
  })
  it('rejects invalid categoryId', () => {
    expect(CreateSubCategorySchema.safeParse({ name: 'T-Shirts', categoryId: 'bad' }).success).toBe(false)
  })
})
