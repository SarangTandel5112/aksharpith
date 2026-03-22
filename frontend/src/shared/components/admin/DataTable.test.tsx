import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable'

type Row = { id: string; name: string; status: string }

const columns = [
  { key: 'name' as const,   label: 'Name' },
  { key: 'status' as const, label: 'Status' },
]

const rows: Row[] = [
  { id: '1', name: 'Electronics', status: 'active' },
  { id: '2', name: 'Clothing',    status: 'inactive' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} rows={rows} isLoading={false} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(<DataTable columns={columns} rows={rows} isLoading={false} />)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Clothing')).toBeInTheDocument()
  })

  it('shows skeleton rows while loading', () => {
    render(<DataTable columns={columns} rows={[]} isLoading={true} />)
    const skeletons = document.querySelectorAll('[data-testid="skeleton-row"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state message when no rows', () => {
    render(<DataTable columns={columns} rows={[]} isLoading={false} emptyMessage="Nothing here." />)
    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
  })

  it('renders action slot per row when renderActions provided', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={false}
        renderActions={(row) => <button type="button">Edit {row.name}</button>}
      />,
    )
    expect(screen.getByText('Edit Electronics')).toBeInTheDocument()
  })
})
