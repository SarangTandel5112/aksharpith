import { authOptions } from "@shared/lib/auth-options";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type React from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminTopbar } from "./_components/AdminTopbar";

export default async function AdminLayout(props: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-zinc-50">
        <AdminTopbar session={session} />
        <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
      </div>
    </div>
  );
}
