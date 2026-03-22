import { bffGet, bffMutate }  from '@app/api/_lib/bff-handler'
import { validateBody }       from '@app/api/_lib/validate-request'
import { CreateRoleSchema }   from '@features/admin/roles/schemas/roles.schema'
import { type NextRequest }   from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/roles', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateRoleSchema)
  if (v.error !== null) return v.error
  return bffMutate({
    path:          '/api/roles',
    method:        'POST',
    request:       req,
    body:          v.data,
    requiredRoles: ['Admin'],
  })
}
