import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const ProductMediaSchema = z.object({
  url: z.string().url(),
  mediaType: z.enum(["image", "video"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/media`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, ProductMediaSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/media`,
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
