import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { CreateProductSchema } from '@features/admin/products/schemas/products.schema'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/products', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateProductSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: '/api/products', method: 'POST', request: req, body: v.data, requiredRoles: ['Admin'] })
}
