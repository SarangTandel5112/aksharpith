import type React from "react";

export default function AdminLoading(): React.JSX.Element {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
		</div>
	);
}
