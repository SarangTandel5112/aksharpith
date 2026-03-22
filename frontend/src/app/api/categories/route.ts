import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { CreateCategorySchema } from '@features/admin/categories/schemas/categories.schema'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/categories', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateCategorySchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: '/api/categories', method: 'POST', request: req, body: v.data, requiredRoles: ['Admin'] })
}
