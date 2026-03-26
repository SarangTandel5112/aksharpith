import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { UpdateGroupSchema } from '@features/admin/groups/schemas/groups.schema'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffGet({ path: `/api/product-groups/${id}`, request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v = await validateBody(req, UpdateGroupSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: `/api/product-groups/${id}`, method: 'PATCH', request: req, body: v.data, requiredRoles: ['Admin'] })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffMutate({ path: `/api/product-groups/${id}`, method: 'DELETE', request: req, requiredRoles: ['Admin'] })
}
