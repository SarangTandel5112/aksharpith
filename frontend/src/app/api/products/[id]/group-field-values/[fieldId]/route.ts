import { bffMutate } from "@app/api/_lib/bff-handler";
import type { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; fieldId: string }> },
) {
  const { id, fieldId } = await props.params;
  return bffMutate({
    path: `/api/products/${id}/group-field-values/${fieldId}`,
    method: "DELETE",
    request: req,
    requiredRoles: ["Admin"],
  });
}
