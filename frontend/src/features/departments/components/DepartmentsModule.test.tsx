import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@test/msw/server";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { DepartmentsModule } from "./DepartmentsModule";

// ── Deterministic mock data ────────────────────────────────────────────────────

// ── Wrapper ────────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper(props: {
    children: React.ReactNode;
  }): React.JSX.Element {
    return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    ) as React.JSX.Element;
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("DepartmentsModule", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("renders the page header with title", () => {
    render(<DepartmentsModule />, { wrapper: createWrapper() });
    expect(screen.getByText("Departments")).toBeInTheDocument();
  });

  it("shows department names after loading", async () => {
    render(<DepartmentsModule />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Fashion")).toBeInTheDocument();
    });
  });

  it("opens add dialog when clicking Add Department", async () => {
    const user = userEvent.setup();
    render(<DepartmentsModule />, { wrapper: createWrapper() });
    await user.click(screen.getByRole("button", { name: /add department/i }));
    expect(
      screen.getByRole("heading", { name: "Add Department" }),
    ).toBeInTheDocument();
  });

  it("opens delete dialog when clicking delete", async () => {
    const user = userEvent.setup();
    render(<DepartmentsModule />, { wrapper: createWrapper() });
    await waitFor(() =>
      expect(screen.getByText("Electronics")).toBeInTheDocument(),
    );
    // Open the row actions dropdown for the first row
    const rowActionButtons = screen.getAllByRole("button", {
      name: /department actions/i,
    });
    // Safe: MOCK_DEPARTMENTS has 2 items so rowActionButtons[0] is guaranteed to exist
    await user.click(rowActionButtons[0]!);
    // Click Delete in the dropdown
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));
    expect(
      screen.getByRole("heading", { name: /delete department/i }),
    ).toBeInTheDocument();
  });
});
