'use client'

import { cn } from '@shared/lib/cn'
import { useState } from 'react'

type CardItem = {
  title:       string
  description: string
  link:        string
}

type CardHoverEffectProps = {
  items:     CardItem[]
  className?: string
}

export function CardHoverEffect(props: CardHoverEffectProps): React.JSX.Element {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', props.className)}>
      {props.items.map((item, idx) => (
        <a
          key={item.link}
          href={item.link}
          className="relative group block rounded-xl border border-[var(--surface-border)] p-6 hover:border-[var(--primary-500)] transition-colors bg-[var(--surface-subtle)] hover:bg-[var(--bg-dark-2)]"
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {hoveredIdx === idx && (
            <span className="absolute inset-0 rounded-xl bg-[var(--primary-alpha-1)]" />
          )}
          <h3 className="relative text-sm font-semibold text-[var(--text-heading)] mb-1">
            {item.title}
          </h3>
          <p className="relative text-xs text-[var(--text-muted)] line-clamp-2">
            {item.description}
          </p>
        </a>
      ))}
    </div>
  )
}
