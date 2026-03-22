import { describe, expect, it } from 'vitest'
import { CreateGroupSchema } from './groups.schema'
describe('CreateGroupSchema', () => {
  it('accepts valid group', () => {
    expect(CreateGroupSchema.safeParse({ groupName: 'Electronics Specs' }).success).toBe(true)
  })
  it('rejects empty groupName', () => {
    expect(CreateGroupSchema.safeParse({ groupName: '' }).success).toBe(false)
  })
})
