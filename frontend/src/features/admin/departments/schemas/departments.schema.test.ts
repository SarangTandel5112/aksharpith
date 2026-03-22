import { describe, expect, it } from 'vitest'
import { CreateDepartmentSchema } from './departments.schema'

describe('CreateDepartmentSchema', () => {
  it('accepts valid department', () => {
    expect(CreateDepartmentSchema.safeParse({ name: 'Electronics' }).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(CreateDepartmentSchema.safeParse({ name: '' }).success).toBe(false)
  })
})
