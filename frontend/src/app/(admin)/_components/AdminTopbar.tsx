"use client";

import { usePathname } from "next/navigation";
import type React from "react";

export function AdminTopbar(): React.JSX.Element {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-base font-semibold text-zinc-900">{pageTitle}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-900">Catalog Team</p>
          <p className="text-xs text-zinc-500">Client Preview</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
          CT
        </div>
      </div>
    </header>
  );
}

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    return "Dashboard";
  }

  if (pathname === "/admin/variants") {
    return "Lot Matrix";
  }

  if (pathname === "/admin/products/new") {
    return "New Product";
  }

  if (/^\/admin\/products\/[^/]+\/variants$/.test(pathname)) {
    return "Product Lot Matrix";
  }

  if (/^\/admin\/products\/[^/]+$/.test(pathname)) {
    return "Product Details";
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "dashboard";
  return formatSegment(lastSegment);
}
