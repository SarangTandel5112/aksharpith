import { bffGet, bffMutate } from "@app/api/_lib/bff-handler";
import { validateBody } from "@app/api/_lib/validate-request";
import { DepartmentFormSchema } from "@features/departments/validations/department-form.schema";
import { authOptions } from "@shared/lib/auth-options";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  return bffGet({
    path: "/api/departments",
    request: req,
    requiredRoles: ["Admin", "Staff"],
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(
      { statusCode: 401, message: "Unauthorized", data: null },
      { status: 401 },
    );
  }

  const v = await validateBody(req, DepartmentFormSchema);
  if (v.error !== null) return v.error;
  return bffMutate({
    path: "/api/departments",
    method: "POST",
    request: req,
    body: v.data,
    requiredRoles: ["Admin"],
  });
}
