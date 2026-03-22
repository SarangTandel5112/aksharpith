import type React from "react";

export function AdminTopbar(): React.JSX.Element {
	return (
		<header className="flex h-14 items-center justify-between border-b bg-background px-6">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">Admin</span>
			</div>
			<div className="flex items-center gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
					AD
				</div>
			</div>
		</header>
	);
}
