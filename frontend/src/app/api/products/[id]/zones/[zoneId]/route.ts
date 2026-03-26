import { bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const ZoneSchema = z.object({
  zoneName: z.string().min(1).max(100).optional(),
  zoneCode: z.string().max(10).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string; zoneId: string }> },
) {
  const { id, zoneId } = await props.params;
  const v = await validateBody(req, ZoneSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/zones/${zoneId}`,
    method: "PATCH",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; zoneId: string }> },
) {
  const { id, zoneId } = await props.params;
  return bffMutate({
    path: `/api/products/${id}/zones/${zoneId}`,
    method: "DELETE",
    request: req,
    requiredRoles: ["Admin"],
  });
}
