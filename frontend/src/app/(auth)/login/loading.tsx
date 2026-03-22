// src/app/(auth)/login/loading.tsx
export default function LoginLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm px-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[var(--surface-subtle)]" />
      <div className="h-4 w-32 rounded bg-[var(--surface-subtle)]" />
      <div className="h-10 w-full rounded bg-[var(--surface-subtle)]" />
      <div className="h-10 w-full rounded bg-[var(--surface-subtle)]" />
      <div className="h-10 w-full rounded bg-[var(--primary-alpha-2)]" />
    </div>
  )
}
