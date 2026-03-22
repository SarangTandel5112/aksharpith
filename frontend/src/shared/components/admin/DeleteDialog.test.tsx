import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DeleteDialog } from './DeleteDialog'

describe('DeleteDialog', () => {
  it('renders title and description when open', () => {
    render(
      <DeleteDialog
        open={true}
        title="Delete Department"
        description='Are you sure you want to delete "Electronics"?'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting={false}
      />,
    )
    expect(screen.getByText('Delete Department')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure/)).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <DeleteDialog
        open={true}
        title="Delete"
        description="Sure?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        isDeleting={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <DeleteDialog
        open={true}
        title="Delete"
        description="Sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
        isDeleting={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables confirm button and shows spinner while deleting', () => {
    render(
      <DeleteDialog
        open={true}
        title="Delete"
        description="Sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting={true}
      />,
    )
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
  })

  it('does not render content when closed', () => {
    render(
      <DeleteDialog
        open={false}
        title="Delete"
        description="Sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting={false}
      />,
    )
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
})
