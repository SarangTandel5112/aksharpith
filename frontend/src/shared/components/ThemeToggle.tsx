// src/shared/components/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div className="h-8 w-8 rounded-md" aria-hidden="true" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
