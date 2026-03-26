import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const GroupFieldValueSchema = z.object({
  values: z.array(
    z.object({
      fieldId: z.string().uuid(),
      valueText: z.string().nullable().optional(),
      valueNumber: z.number().nullable().optional(),
      valueBoolean: z.boolean().nullable().optional(),
      valueOptionId: z.string().uuid().nullable().optional(),
    }),
  ),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/group-field-values`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, GroupFieldValueSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/group-field-values`,
    method: "PUT",
    request: req,
    body: v.data,
    requiredRoles: ["Admin", "Staff"],
  });
}
