import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { CreateUserSchema } from '@features/admin/users/schemas/users.schema'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/users', request: req, requiredRoles: ['Admin'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateUserSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: '/api/users', method: 'POST', request: req, body: v.data, requiredRoles: ['Admin'] })
}
