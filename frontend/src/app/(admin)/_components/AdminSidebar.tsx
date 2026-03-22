"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconShield } from "@tabler/icons-react";
import { cn } from "@shared/lib/utils";
import { NAV_SECTIONS } from "./nav-items";

export function AdminSidebar(): React.JSX.Element {
	const pathname = usePathname();

	return (
		<aside className="flex h-screen w-60 flex-col border-r bg-background">
			{/* Brand */}
			<div className="flex h-14 items-center gap-2 border-b px-4">
				<IconShield className="h-5 w-5 text-primary" />
				<span className="text-sm font-semibold tracking-tight">
					Aksharpith Admin
				</span>
			</div>

			{/* Nav */}
			<nav className="flex-1 overflow-y-auto py-4">
				{NAV_SECTIONS.map((section) => (
					<div key={section.title} className="mb-4 px-3">
						<p className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							{section.title}
						</p>
						<ul className="space-y-0.5">
							{section.items.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== "/admin" &&
										pathname.startsWith(item.href));
								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className={cn(
												"flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
												isActive
													? "bg-accent text-accent-foreground font-medium"
													: "text-muted-foreground hover:text-foreground hover:bg-accent/50",
											)}
										>
											<item.icon className="h-4 w-4 shrink-0" />
											{item.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>
		</aside>
	);
}
