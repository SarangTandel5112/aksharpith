import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import UnauthorizedPage from "./page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UnauthorizedPage", () => {
  it("renders the access denied heading", () => {
    render(<UnauthorizedPage />);
    expect(
      screen.getByRole("heading", { name: /access denied/i }),
    ).toBeInTheDocument();
  });

  it("renders the access guidance copy", () => {
    render(<UnauthorizedPage />);
    expect(
      screen.getByText(/contact an administrator if you need access/i),
    ).toBeInTheDocument();
  });
});
