"use client";

import type React from "react";

export default function AdminError(props: {
	error: Error & { digest?: string };
	reset: () => void;
}): React.JSX.Element {
	return (
		<div className="flex flex-col items-center justify-center h-full gap-4">
			<p className="text-sm text-muted-foreground">Something went wrong.</p>
			<button
				type="button"
				onClick={props.reset}
				className="text-sm text-primary underline-offset-4 hover:underline"
			>
				Try again
			</button>
		</div>
	);
}
