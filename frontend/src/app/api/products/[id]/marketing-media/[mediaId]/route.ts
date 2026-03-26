import { bffMutate } from "@app/api/_lib/bff-handler";
import type { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; mediaId: string }> },
) {
  const { id, mediaId } = await props.params;
  return bffMutate({
    path: `/api/products/${id}/marketing-media/${mediaId}`,
    method: "DELETE",
    request: req,
    requiredRoles: ["Admin"],
  });
}
