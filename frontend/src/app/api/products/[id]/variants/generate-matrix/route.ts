import { bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const GenerateMatrixSchema = z.object({
  attributeIds: z.array(z.string().uuid()).min(1),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, GenerateMatrixSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/variants/generate-matrix`,
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
