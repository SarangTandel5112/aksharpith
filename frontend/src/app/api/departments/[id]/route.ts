import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import { DepartmentPatchSchema } from "@features/departments/validations/department-form.schema";
import { authOptions } from "@shared/lib/auth-options";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffGet({
    path: `/api/departments/${id}`,
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(
      { statusCode: 401, message: "Unauthorized", data: null },
      { status: 401 },
    );
  }

  const { id } = await props.params;
  const v = await validateBody(req, DepartmentPatchSchema);
  if (v.error !== null) return v.error;
  return bffMutate({
    path: `/api/departments/${id}`,
    method: "PATCH",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  return bffMutate({
    path: `/api/departments/${id}`,
    method: "DELETE",
    request: req,
    requiredRoles: ["Admin"],
  });
}
