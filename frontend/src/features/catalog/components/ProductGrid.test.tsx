import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ProductGrid } from './ProductGrid'

function makeWrapper(qc: QueryClient) {
  return function Wrapper(props: { children: React.ReactNode }): React.JSX.Element {
    return <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
  }
}

const products = [
  {
    id: 'p1', name: 'Blue Shirt', sku: 'BS-001', description: 'Nice shirt',
    basePrice: 29.99,
    category: { id: 'c1', name: 'Clothing' },
    subCategory: null,
    department: { id: 'd1', name: 'Retail' },
    isActive: true, createdAt: '', updatedAt: '',
  },
]

describe('ProductGrid', () => {
  it('renders product cards when products are provided', () => {
    const qc = new QueryClient()
    render(<ProductGrid products={products} isLoading={false} />, {
      wrapper: makeWrapper(qc),
    })
    expect(screen.getByText('Blue Shirt')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    const qc = new QueryClient()
    render(<ProductGrid products={[]} isLoading />, {
      wrapper: makeWrapper(qc),
    })
    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    const qc = new QueryClient()
    render(<ProductGrid products={[]} isLoading={false} />, {
      wrapper: makeWrapper(qc),
    })
    expect(screen.getByText(/no products found/i)).toBeInTheDocument()
  })
})
