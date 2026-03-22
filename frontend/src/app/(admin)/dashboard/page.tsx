// src/app/(admin)/dashboard/page.tsx
export default function DashboardPage(): React.JSX.Element {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--text-heading)] mb-4">Dashboard</h1>
      <p className="text-sm text-[var(--text-muted)]">
        Use the sidebar to manage catalog data.
      </p>
    </div>
  )
}
