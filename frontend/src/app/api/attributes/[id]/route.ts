import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { UpdateAttributeSchema } from '@features/admin/attributes/schemas/attributes.schema'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffGet({ path: `/api/attributes/${id}`, request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v = await validateBody(req, UpdateAttributeSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: `/api/attributes/${id}`, method: 'PATCH', request: req, body: v.data, requiredRoles: ['Admin'] })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffMutate({ path: `/api/attributes/${id}`, method: 'DELETE', request: req, requiredRoles: ['Admin'] })
}
