// src/shared/lib/api-schemas.test.ts
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { apiEnvelope, paginatedEnvelope } from './api-schemas'

describe('apiEnvelope', () => {
  it('parses a valid NestJS response envelope', () => {
    const schema = apiEnvelope(z.object({ name: z.string() }))
    const result = schema.safeParse({
      statusCode: 200,
      message: 'OK',
      data: { name: 'test' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.name).toBe('test')
    }
  })

  it('rejects missing data field', () => {
    const schema = apiEnvelope(z.object({ name: z.string() }))
    const result = schema.safeParse({ statusCode: 200, message: 'OK' })
    expect(result.success).toBe(false)
  })
})

describe('paginatedEnvelope', () => {
  it('parses a valid paginated response', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }))
    const result = schema.safeParse({
      statusCode: 200,
      message: 'OK',
      data: {
        items: [{ id: 'abc' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.items[0]?.id).toBe('abc')
    }
  })

  it('rejects when items array contains wrong shape', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }))
    const result = schema.safeParse({
      statusCode: 200,
      message: 'OK',
      data: {
        items: [{ notId: 'wrong' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
    expect(result.success).toBe(false)
  })
})
