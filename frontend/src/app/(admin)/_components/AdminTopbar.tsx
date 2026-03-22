"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import type React from "react";

type AdminTopbarProps = {
  session: Session;
};

export function AdminTopbar(props: AdminTopbarProps): React.JSX.Element {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "dashboard";
  const pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

  const firstName = props.session.user.firstName;
  const initials = (
    props.session.user.firstName.charAt(0) +
    props.session.user.lastName.charAt(0)
  ).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-base font-semibold text-zinc-900">{pageTitle}</h1>
      <div className="flex items-center gap-2.5">
        <span className="text-sm text-zinc-500">{firstName}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
