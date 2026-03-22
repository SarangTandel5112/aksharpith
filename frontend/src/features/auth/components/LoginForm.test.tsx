// src/features/auth/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows validation error for empty email on submit', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with email and password when valid', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email:    'admin@test.com',
        password: 'password123',
      })
    })
  })

  it('shows error message when errorMessage prop is set', () => {
    render(<LoginForm onSubmit={vi.fn()} errorMessage="Invalid credentials" />)
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('disables submit button while loading', () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
