import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody }      from '@app/api/_lib/validate-request'
import { z }                 from 'zod'
import { type NextRequest }  from 'next/server'

const CreateVariantSchema = z.object({
  sku:        z.string().min(1),
  price:      z.number().min(0),
  stock:      z.number().int().min(0),
  attributes: z.array(z.object({ attributeId: z.string(), value: z.string() })),
})

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffGet({ path: `/api/products/${id}/variants`, request: req })
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v      = await validateBody(req, CreateVariantSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: `/api/products/${id}/variants`, method: 'POST', request: req, body: v.data })
}
