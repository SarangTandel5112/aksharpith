import type React from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminTopbar } from "./_components/AdminTopbar";

export default function AdminLayout(props: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<div className="flex h-screen overflow-hidden bg-muted/30">
			<AdminSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<AdminTopbar />
				<main className="flex-1 overflow-y-auto p-6">{props.children}</main>
			</div>
		</div>
	);
}
