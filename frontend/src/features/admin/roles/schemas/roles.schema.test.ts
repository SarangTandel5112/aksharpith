import { describe, expect, it } from 'vitest'
import { CreateRoleSchema } from './roles.schema'

describe('CreateRoleSchema', () => {
  it('accepts valid role', () => {
    expect(CreateRoleSchema.safeParse({ roleName: 'Manager' }).success).toBe(true)
  })
  it('rejects empty roleName', () => {
    expect(CreateRoleSchema.safeParse({ roleName: '' }).success).toBe(false)
  })
})
