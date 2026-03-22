// src/shared/lib/api-schemas.ts
import { z } from 'zod'

// Wraps any schema in the NestJS response envelope: { statusCode, message, data }
export function apiEnvelope<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    statusCode: z.number(),
    message:    z.string(),
    data:       dataSchema,
  })
}

// Wraps any schema in a paginated NestJS envelope
// Matches PaginatedResponseDto from nest-backend
export function paginatedEnvelope<T>(itemSchema: z.ZodType<T>) {
  return apiEnvelope(
    z.object({
      items:      z.array(itemSchema),
      total:      z.number(),
      page:       z.number(),
      limit:      z.number(),
      totalPages: z.number(),
    }),
  )
}
