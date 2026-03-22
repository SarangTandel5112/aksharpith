// src/app/unauthorized/page.tsx
import Link from 'next/link'

export default function UnauthorizedPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-2xl font-bold text-[var(--text-heading)]">
        Access Denied
      </h1>
      <p className="text-sm text-[var(--text-muted)] max-w-sm">
        You do not have permission to view this page. Contact an administrator if you need access.
      </p>
      <Link
        href="/products"
        className="text-sm text-[var(--primary-500)] underline"
      >
        Back to catalog
      </Link>
    </main>
  )
}
