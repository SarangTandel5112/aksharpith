import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody } from '@app/api/_lib/validate-request'
import { UpdateProductSchema } from '@features/admin/products/schemas/products.schema'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffGet({ path: `/api/products/${id}`, request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v = await validateBody(req, UpdateProductSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: `/api/products/${id}`, method: 'PATCH', request: req, body: v.data, requiredRoles: ['Admin'] })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffMutate({ path: `/api/products/${id}`, method: 'DELETE', request: req, requiredRoles: ['Admin'] })
}
