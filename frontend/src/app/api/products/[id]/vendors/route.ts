import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const VendorSchema = z.object({
  vendorName: z.string().min(1).max(150),
  contactPerson: z.string().max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  gstin: z.string().max(15).optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/products/${id}/vendors`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const v = await validateBody(req, VendorSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/vendors`,
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
