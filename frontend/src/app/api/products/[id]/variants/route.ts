import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const CreateVariantSchema = z.object({
  sku: z.string().min(1).max(100),
  price: z.number().min(0),
  stockQuantity: z.number().int().min(0).optional(),
  attributeValueIds: z.array(z.string().uuid()).min(1),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/variants`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, CreateVariantSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/variants`,
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
