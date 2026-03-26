// src/app/api/_lib/bff-handler.ts
// Helper utilities for BFF route handlers.
// All admin API routes use these to avoid repeating auth check + NestJS proxy.

import { apiFetch } from "@shared/lib/api-fetch";
import { authOptions } from "@shared/lib/auth-options";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

type BffGetOptions = {
  path: string;
  request: NextRequest;
  requiredRoles?: string[];
};

type BffMutateOptions = {
  path: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  request: NextRequest;
  body?: unknown;
  requiredRoles?: string[];
};

async function toBffResponse(res: Response): Promise<NextResponse> {
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  if (text === "") {
    return new NextResponse(null, { status: res.status });
  }

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return new NextResponse(text, { status: res.status });
  }
}

export async function bffGet(options: BffGetOptions): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (options.requiredRoles !== undefined) {
    const roleName = session.user.role?.name ?? "";
    if (!options.requiredRoles.includes(roleName)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const url = new URL(options.request.url);
  const nestPath = `${options.path}${url.search}`;

  const res = await apiFetch(nestPath, { accessToken: session.accessToken });
  return toBffResponse(res);
}

export async function bffMutate(
  options: BffMutateOptions,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (options.requiredRoles !== undefined) {
    const roleName = session.user.role?.name ?? "";
    if (!options.requiredRoles.includes(roleName)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const bodyStr =
    options.body !== undefined ? JSON.stringify(options.body) : undefined;
  const res = await apiFetch(options.path, {
    method: options.method,
    ...(bodyStr !== undefined ? { body: bodyStr } : {}),
    accessToken: session.accessToken,
  });
  return toBffResponse(res);
}
