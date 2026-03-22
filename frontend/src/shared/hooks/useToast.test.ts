import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
    info:    vi.fn(),
    warning: vi.fn(),
  },
}))

import { toast as sonnerToast } from 'sonner'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls sonner toast.success', () => {
    const t = useToast()
    t.success('Saved!')
    expect(sonnerToast.success).toHaveBeenCalledWith('Saved!')
  })

  it('calls sonner toast.error', () => {
    const t = useToast()
    t.error('Failed')
    expect(sonnerToast.error).toHaveBeenCalledWith('Failed')
  })

  it('calls sonner toast.info', () => {
    const t = useToast()
    t.info('Note')
    expect(sonnerToast.info).toHaveBeenCalledWith('Note')
  })

  it('calls sonner toast.warning', () => {
    const t = useToast()
    t.warning('Watch out')
    expect(sonnerToast.warning).toHaveBeenCalledWith('Watch out')
  })
})
