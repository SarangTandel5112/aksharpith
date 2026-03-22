import { bffGet, bffMutate }         from '@app/api/_lib/bff-handler'
import { validateBody }               from '@app/api/_lib/validate-request'
import { CreateDepartmentSchema }     from '@features/admin/departments/schemas/departments.schema'
import type { NextRequest }           from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/departments', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateDepartmentSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: '/api/departments', method: 'POST', request: req, body: v.data, requiredRoles: ['Admin'] })
}
