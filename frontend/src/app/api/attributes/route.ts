import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { CreateAttributeSchema } from '@features/admin/attributes/schemas/attributes.schema'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/attributes', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateAttributeSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: '/api/attributes', method: 'POST', request: req, body: v.data, requiredRoles: ['Admin'] })
}
