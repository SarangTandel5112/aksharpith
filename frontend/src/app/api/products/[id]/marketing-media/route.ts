import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const MarketingMediaSchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(["photo", "video"]).optional(),
  displayOrder: z.number().int().min(0).optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  fileSize: z.number().int().min(0).optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/marketing-media`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, MarketingMediaSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/marketing-media`,
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
