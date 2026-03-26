import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const PhysicalAttributesSchema = z.object({
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/physical-attributes`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, PhysicalAttributesSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/physical-attributes`,
    method: "PUT",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
