"use client";

import { create } from "zustand";
import type { LotMatrixState } from "../types/variants.types";

export const useLotMatrixStore = create<LotMatrixState>((set, get) => ({
  selectedAttributeIds: [],
  isSubmitting: false,

  setSelectedAttributeIds: (selectedAttributeIds) => set({ selectedAttributeIds }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  toggleAttribute: (attributeId) => {
    const selectedAttributeIds = get().selectedAttributeIds;
    const next = selectedAttributeIds.includes(attributeId)
      ? selectedAttributeIds.filter((id) => id !== attributeId)
      : [...selectedAttributeIds, attributeId];

    set({ selectedAttributeIds: next });
  },

  reset: () =>
    set({
      selectedAttributeIds: [],
      isSubmitting: false,
    }),
}));

export const selectLotSelectedAttributeIds = (s: LotMatrixState): number[] =>
  s.selectedAttributeIds;
export const selectLotIsSubmitting = (s: LotMatrixState): boolean =>
  s.isSubmitting;
