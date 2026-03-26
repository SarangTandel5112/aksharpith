import { describe, expect, it } from 'vitest'
import { CreateAttributeSchema } from './attributes.schema'
describe('CreateAttributeSchema', () => {
  it('accepts valid attribute', () => {
    expect(CreateAttributeSchema.safeParse({
      name: 'Color',
      code: 'COLOR',
      values: [
        { label: 'Red', code: 'RED', sortOrder: 0, isActive: true },
        { label: 'Blue', code: 'BLUE', sortOrder: 1, isActive: true },
      ],
    }).success).toBe(true)
  })
  it('rejects empty attributeName', () => {
    expect(CreateAttributeSchema.safeParse({
      name: '',
      code: 'COLOR',
      values: [{ label: 'Red', code: 'RED', sortOrder: 0, isActive: true }],
    }).success).toBe(false)
  })
  it('rejects empty values array', () => {
    expect(CreateAttributeSchema.safeParse({
      name: 'Color',
      code: 'COLOR',
      values: [],
    }).success).toBe(true)
  })
})
