import { bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import type { NextRequest } from "next/server";
import { z } from "zod";

const VendorSchema = z.object({
  vendorName: z.string().min(1).max(150).optional(),
  contactPerson: z.string().max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  gstin: z.string().max(15).optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string; vendorId: string }> },
) {
  const { id, vendorId } = await props.params;
  const v = await validateBody(req, VendorSchema);
  if (v.error !== null) return v.error;

  return bffMutate({
    path: `/api/products/${id}/vendors/${vendorId}`,
    method: "PATCH",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; vendorId: string }> },
) {
  const { id, vendorId } = await props.params;
  return bffMutate({
    path: `/api/products/${id}/vendors/${vendorId}`,
    method: "DELETE",
    request: req,
    requiredRoles: ["Admin"],
  });
}
