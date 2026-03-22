import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LotMatrixWizard } from './LotMatrixWizard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLotMatrixStore } from '../stores/lot-matrix.store'

function wrapper(props: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
}

beforeEach(() => useLotMatrixStore.getState().reset())

describe('LotMatrixWizard', () => {
  it('renders Step 1 by default', () => {
    render(<LotMatrixWizard productId="prod-1" />, { wrapper })
    expect(screen.getByText(/Select Attributes/i)).toBeDefined()
  })
})
