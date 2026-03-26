import { describe, expect, it } from 'vitest'
import { CreateProductSchema, ProductCreateWorkspaceSchema } from './products.schema'
const uuid = '550e8400-e29b-41d4-a716-446655440000'
describe('CreateProductSchema', () => {
  it('accepts valid product', () => {
    expect(CreateProductSchema.safeParse({ name: 'T-Shirt', code: 'TSH001', upc: '123456789012', type: 'Standard', hsnCode: '6109', price: 2999, stockQuantity: 10, subCategoryId: uuid, departmentId: uuid, groupId: uuid, nonTaxable: false, itemInactive: false, nonStockItem: false, isActive: true }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateProductSchema.safeParse({ name: '', code: 'TSH001', upc: '123456789012', type: 'Standard', hsnCode: '6109', price: 2999, stockQuantity: 10, subCategoryId: uuid, departmentId: uuid, groupId: uuid, nonTaxable: false, itemInactive: false, nonStockItem: false, isActive: true }).success).toBe(false)
  })
  it('rejects negative price', () => {
    expect(CreateProductSchema.safeParse({ name: 'T-Shirt', code: 'TSH001', upc: '123456789012', type: 'Standard', hsnCode: '6109', price: -100, stockQuantity: 10, subCategoryId: uuid, departmentId: uuid, groupId: uuid, nonTaxable: false, itemInactive: false, nonStockItem: false, isActive: true }).success).toBe(false)
  })
})

describe('ProductCreateWorkspaceSchema', () => {
  it('accepts physical attribute fields used by the create page', () => {
    expect(ProductCreateWorkspaceSchema.safeParse({
      name: 'T-Shirt',
      code: 'TSH001',
      upc: '123456789012',
      type: 'Standard',
      hsnCode: '6109',
      price: 2999,
      stockQuantity: 10,
      departmentId: uuid,
      subCategoryId: uuid,
      groupId: uuid,
      nonTaxable: false,
      itemInactive: false,
      nonStockItem: false,
      isActive: true,
      physicalWeight: '1.2',
      physicalLength: '10',
      physicalWidth: '5',
      physicalHeight: '2',
    }).success).toBe(true)
  })
})
