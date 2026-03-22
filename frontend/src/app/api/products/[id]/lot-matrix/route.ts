import { bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const LotMatrixSchema = z.object({
  variants: z
    .array(
      z.object({
        combination: z.record(z.string(), z.string()),
        sku: z.string(),
        price: z.number().min(0),
        stock: z.number().int().min(0),
      }),
    )
    .min(1),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, LotMatrixSchema);
  if (v.error !== null) return v.error;
  return bffMutate({
    path: `/api/products/${id}/lot-matrix`,
    method: "POST",
    request: req,
    body: v.data,
  });
}
