import { beforeEach, describe, expect, it } from "vitest";
import { useLotMatrixStore } from "./lot-matrix.store";

beforeEach(() => useLotMatrixStore.getState().reset());

describe("lot-matrix.store", () => {
  it("toggleAttribute adds and removes selected attribute IDs", () => {
    useLotMatrixStore.getState().toggleAttribute(1);
    expect(useLotMatrixStore.getState().selectedAttributeIds).toContain(1);

    useLotMatrixStore.getState().toggleAttribute(1);
    expect(useLotMatrixStore.getState().selectedAttributeIds).not.toContain(
      1,
    );
  });

  it("reset clears selection and submit state", () => {
    useLotMatrixStore.getState().toggleAttribute(1);
    useLotMatrixStore.getState().setIsSubmitting(true);

    useLotMatrixStore.getState().reset();

    expect(useLotMatrixStore.getState().selectedAttributeIds).toHaveLength(0);
    expect(useLotMatrixStore.getState().isSubmitting).toBe(false);
  });
});
