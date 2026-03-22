import { describe, expect, it } from 'vitest'
import { CreateAttributeSchema } from './attributes.schema'
describe('CreateAttributeSchema', () => {
  it('accepts valid attribute', () => {
    expect(CreateAttributeSchema.safeParse({ attributeName: 'Color', values: ['Red', 'Blue'] }).success).toBe(true)
  })
  it('rejects empty attributeName', () => {
    expect(CreateAttributeSchema.safeParse({ attributeName: '', values: ['Red'] }).success).toBe(false)
  })
  it('rejects empty values array', () => {
    expect(CreateAttributeSchema.safeParse({ attributeName: 'Color', values: [] }).success).toBe(false)
  })
})
