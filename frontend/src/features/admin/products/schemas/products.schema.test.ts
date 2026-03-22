import { describe, expect, it } from 'vitest'
import { CreateProductSchema } from './products.schema'
const uuid = '550e8400-e29b-41d4-a716-446655440000'
describe('CreateProductSchema', () => {
  it('accepts valid product', () => {
    expect(CreateProductSchema.safeParse({ name: 'T-Shirt', sku: 'TSH001', price: 2999, categoryId: uuid, subCategoryId: uuid, departmentId: uuid }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateProductSchema.safeParse({ name: '', sku: 'TSH001', price: 2999, categoryId: uuid, subCategoryId: uuid, departmentId: uuid }).success).toBe(false)
  })
  it('rejects negative price', () => {
    expect(CreateProductSchema.safeParse({ name: 'T-Shirt', sku: 'TSH001', price: -100, categoryId: uuid, subCategoryId: uuid, departmentId: uuid }).success).toBe(false)
  })
})
