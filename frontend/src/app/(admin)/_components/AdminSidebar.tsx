"use client";

import { cn } from "@shared/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { NAV_SECTIONS } from "./nav-items";

export function AdminSidebar(): React.JSX.Element {
	const pathname = usePathname();

	return (
		<aside className="flex w-56 flex-col bg-zinc-900">
			{/* Brand */}
			<div className="flex h-14 items-center border-b border-zinc-800 px-4">
				<span className="text-sm font-semibold text-white">
					Aksharpith Admin
				</span>
			</div>

			{/* Nav */}
			<nav className="flex-1 overflow-y-auto px-2 py-3">
				{NAV_SECTIONS.map((section) => (
					<div key={section.title} className="mb-4">
						<p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
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
												"flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
												isActive
													? "bg-zinc-700 font-medium text-white"
													: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
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
