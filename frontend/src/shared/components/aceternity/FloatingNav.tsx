'use client'

import { cn }          from '@shared/lib/cn'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@shared/components/ThemeToggle'

type NavItem = {
  name: string
  link: string
}

type FloatingNavProps = {
  navItems:   NavItem[]
  className?: string
}

export function FloatingNav(props: FloatingNavProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav className={cn(
      'fixed top-4 inset-x-0 mx-auto z-50 flex max-w-2xl items-center justify-between rounded-full border border-[var(--surface-border)] bg-[var(--bg-dark-2)]/80 px-4 py-2 backdrop-blur-md shadow-lg',
      props.className,
    )}>
      <div className="flex items-center gap-1">
        {props.navItems.map((item) => (
          <Link
            key={item.link}
            href={item.link}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              pathname === item.link
                ? 'bg-[var(--primary-500)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-body)]',
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <ThemeToggle />
    </nav>
  )
}
