import { Toaster } from "@shared/components/ui/sonner";
import type React from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminTopbar } from "./_components/AdminTopbar";

export default async function AdminLayout(props: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  return (
    <div className="flex h-dvh overflow-hidden overscroll-none bg-zinc-50">
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-50">
        <AdminTopbar />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-zinc-50 p-6">
          {props.children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
