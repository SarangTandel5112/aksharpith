// src/app/(admin)/layout.tsx
import { ThemeToggle } from '@shared/components/ThemeToggle'
import Link            from 'next/link'

const NAV_ITEMS = [
  { label: 'Dashboard',      href: '/admin/dashboard' },
  { label: 'Roles',          href: '/admin/roles' },
  { label: 'Departments',    href: '/admin/departments' },
  { label: 'Categories',     href: '/admin/categories' },
  { label: 'Sub-Categories', href: '/admin/sub-categories' },
  { label: 'Groups',         href: '/admin/groups' },
  { label: 'Attributes',     href: '/admin/attributes' },
  { label: 'Users',          href: '/admin/users' },
  { label: 'Products',       href: '/admin/products' },
]

type AdminLayoutProps = { children: React.ReactNode }

export default function AdminLayout(props: AdminLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen bg-[var(--surface-subtle)]">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--surface-shell)] flex flex-col shrink-0">
        <div className="flex items-center h-14 px-4 border-b border-[var(--bg-dark-3)]">
          <span className="text-sm font-bold text-white">Admin Portal</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center h-9 px-3 rounded-md text-sm text-[var(--text-muted)] hover:bg-[var(--bg-dark-3)] hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-6 bg-[var(--surface-page)] border-b border-[var(--surface-border)] shrink-0">
          <span className="text-sm font-medium text-[var(--text-heading)]">Admin Panel</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {props.children}
        </main>
      </div>
    </div>
  )
}
