import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { CreateGroupSchema } from '@features/admin/groups/schemas/groups.schema'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/groups', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateGroupSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: '/api/groups', method: 'POST', request: req, body: v.data, requiredRoles: ['Admin'] })
}
