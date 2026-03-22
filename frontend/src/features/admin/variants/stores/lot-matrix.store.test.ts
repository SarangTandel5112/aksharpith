import { describe, beforeEach, it, expect } from 'vitest'
import { useLotMatrixStore } from './lot-matrix.store'
import type { Attribute } from '@features/admin/attributes/types/attributes.types'

beforeEach(() => useLotMatrixStore.getState().reset())

const sizeAttr: Attribute = {
  id: 'attr-1', attributeName: 'Size', description: '', values: ['S', 'M', 'L'],
  createdAt: '', updatedAt: '',
}
const colorAttr: Attribute = {
  id: 'attr-2', attributeName: 'Color', description: '', values: ['Red', 'Blue'],
  createdAt: '', updatedAt: '',
}

describe('lot-matrix.store', () => {
  it('toggleAttribute adds and removes attribute IDs', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    expect(useLotMatrixStore.getState().selectedAttrIds).toContain('attr-1')
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    expect(useLotMatrixStore.getState().selectedAttrIds).not.toContain('attr-1')
  })

  it('generateMatrix produces correct number of rows', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    useLotMatrixStore.getState().toggleAttribute('attr-2')
    useLotMatrixStore.getState().generateMatrix([sizeAttr, colorAttr])
    // 3 sizes × 2 colors = 6
    expect(useLotMatrixStore.getState().matrix).toHaveLength(6)
  })

  it('updateMatrixRow updates sku for the correct row', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    useLotMatrixStore.getState().generateMatrix([sizeAttr])
    useLotMatrixStore.getState().updateMatrixRow(0, 'sku', 'SIZE-S-001')
    expect(useLotMatrixStore.getState().matrix[0]?.sku).toBe('SIZE-S-001')
  })

  it('reset clears all state', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    useLotMatrixStore.getState().reset()
    expect(useLotMatrixStore.getState().selectedAttrIds).toHaveLength(0)
    expect(useLotMatrixStore.getState().step).toBe(1)
  })
})
