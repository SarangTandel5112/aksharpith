import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LotMatrixWizard } from "./LotMatrixWizard";
import { useLotMatrixStore } from "../stores/lot-matrix.store";

beforeEach(() => useLotMatrixStore.getState().reset());

describe("LotMatrixWizard", () => {
  it("renders the attribute picker by default", () => {
    render(<LotMatrixWizard productId="1" />);
    expect(screen.getByText(/Choose Attributes/i)).toBeInTheDocument();
  });
});
