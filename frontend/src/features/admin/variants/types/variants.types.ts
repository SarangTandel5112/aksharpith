import type { Attribute } from '@features/admin/attributes/types/attributes.types'

export type VariantAttribute = {
  attributeId:   string
  attributeName: string
  value:         string
}

export type Variant = {
  id:         string
  productId:  string
  sku:        string
  price:      number
  stock:      number
  attributes: VariantAttribute[]
  isActive:   boolean
  createdAt:  string
  updatedAt:  string
}

export type MatrixRow = {
  combination: Record<string, string>  // attributeName → value
  sku:         string
  price:       number
  stock:       number
}

export type LotMatrixState = {
  step:            1 | 2 | 3
  productId:       string
  selectedAttrIds: string[]
  matrix:          MatrixRow[]
  isSubmitting:    boolean
  // Actions
  setStep:         (step: 1 | 2 | 3) => void
  setProductId:    (id: string) => void
  toggleAttribute: (id: string) => void
  generateMatrix:  (attributes: Attribute[]) => void
  updateMatrixRow: (idx: number, field: 'sku' | 'price' | 'stock', value: string | number) => void
  setIsSubmitting: (v: boolean) => void
  reset:           () => void
}
