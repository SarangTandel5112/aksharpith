import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const ZoneSchema = z.object({
  zoneName: z.string().min(1).max(100),
  zoneCode: z.string().max(10).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/zones`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, ZoneSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/zones`,
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
