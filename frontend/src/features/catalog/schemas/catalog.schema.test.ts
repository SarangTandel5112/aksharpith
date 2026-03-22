import { describe, expect, it } from 'vitest'
import { CatalogProductSchema } from './catalog.schema'

describe('CatalogProductSchema', () => {
  it('accepts a valid product', () => {
    const result = CatalogProductSchema.safeParse({
      id: 'p1', name: 'Test', sku: 'T-001', description: 'Desc',
      basePrice: 99.99,
      category:    { id: 'c1', name: 'Cat' },
      subCategory: null,
      department:  { id: 'd1', name: 'Dep' },
      isActive: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = CatalogProductSchema.safeParse({ id: 'p1', sku: 'T-001' })
    expect(result.success).toBe(false)
  })
})
