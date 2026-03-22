'use client'

import { create } from 'zustand'
import type { LotMatrixState, MatrixRow } from '../types/variants.types'
import type { Attribute } from '@features/admin/attributes/types/attributes.types'

function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap((a) => arr.map((v) => [...a, v])),
    [[]],
  )
}

export const useLotMatrixStore = create<LotMatrixState>((set, get) => ({
  step:            1,
  productId:       '',
  selectedAttrIds: [],
  matrix:          [],
  isSubmitting:    false,

  setStep:         (step)         => set({ step }),
  setProductId:    (productId)    => set({ productId }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  toggleAttribute: (id) => {
    const current = get().selectedAttrIds
    set({
      selectedAttrIds: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  },

  generateMatrix: (attributes: Attribute[]) => {
    const selected = attributes.filter((a) =>
      get().selectedAttrIds.includes(a.id),
    )
    if (selected.length === 0) { set({ matrix: [] }); return }

    const names  = selected.map((a) => a.attributeName)
    const values = selected.map((a) => a.values)
    const combos = cartesianProduct(values)

    const matrix: MatrixRow[] = combos.map((combo) => ({
      combination: Object.fromEntries(names.map((n, i) => [n, combo[i] ?? ''])),
      sku:         '',
      price:       0,
      stock:       0,
    }))

    set({ matrix })
  },

  updateMatrixRow: (idx, field, value) => {
    const matrix = [...get().matrix]
    // Safe: matrix is built from cartesianProduct so idx is always valid
    matrix[idx] = { ...matrix[idx]!, [field]: value }
    set({ matrix })
  },

  reset: () => set({
    step:            1,
    productId:       '',
    selectedAttrIds: [],
    matrix:          [],
    isSubmitting:    false,
  }),
}))

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectLotStep            = (s: LotMatrixState): 1 | 2 | 3  => s.step
export const selectLotSelectedAttrIds = (s: LotMatrixState): string[]   => s.selectedAttrIds
export const selectLotMatrix          = (s: LotMatrixState): MatrixRow[] => s.matrix
export const selectLotIsSubmitting    = (s: LotMatrixState): boolean     => s.isSubmitting
