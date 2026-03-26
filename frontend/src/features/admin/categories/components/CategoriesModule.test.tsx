import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { CategoriesModule } from "./CategoriesModule";

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

describe("CategoriesModule", () => {
  it("renders the page header with title", () => {
    render(<CategoriesModule />, { wrapper: createWrapper() });
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("shows category names after loading", async () => {
    render(<CategoriesModule />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("Audio")).toBeInTheDocument();
      expect(screen.getByText("Smart Devices")).toBeInTheDocument();
    });
  });

  it("opens add dialog when clicking Add Category", async () => {
    const user = userEvent.setup();
    render(<CategoriesModule />, { wrapper: createWrapper() });
    await user.click(screen.getByRole("button", { name: /add category/i }));
    expect(
      screen.getByRole("heading", { name: "Add Category" }),
    ).toBeInTheDocument();
  });

  it("opens delete dialog when clicking delete", async () => {
    const user = userEvent.setup();
    render(<CategoriesModule />, { wrapper: createWrapper() });
    await waitFor(() =>
      expect(screen.getByText("Audio")).toBeInTheDocument(),
    );
    const actionButtons = screen.getAllByRole("button", {
      name: /category actions/i,
    });
    await user.click(actionButtons[0]!);
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));
    expect(
      screen.getByRole("heading", { name: /delete category/i }),
    ).toBeInTheDocument();
  });
});
