import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const UpdateVariantSchema = z.object({
  price: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; variantId: string }> },
) {
  const { id, variantId } = await props.params;
  return bffGet({
    path: `/api/products/${id}/variants/${variantId}`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string; variantId: string }> },
) {
  const { id, variantId } = await props.params;
  const v = await validateBody(req, UpdateVariantSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/variants/${variantId}`,
    method: "PATCH",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; variantId: string }> },
) {
  const { id, variantId } = await props.params;
  return bffMutate({
    path: `/api/products/${id}/variants/${variantId}`,
    method: "DELETE",
    request: req,
    requiredRoles: ["Admin"],
  });
}
