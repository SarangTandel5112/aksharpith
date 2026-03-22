// @vitest-environment happy-dom
import { vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}))

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UnauthorizedPage from './page'

describe('UnauthorizedPage', () => {
  it('renders the access denied heading', () => {
    render(<UnauthorizedPage />)
    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument()
  })

  it('renders a link back to the catalog', () => {
    render(<UnauthorizedPage />)
    const link = screen.getByRole('link', { name: /back to catalog/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/products')
  })
})
