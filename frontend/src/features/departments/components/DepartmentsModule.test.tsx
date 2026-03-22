import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@test/msw/server";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { DepartmentsModule } from "./DepartmentsModule";

// ── Deterministic mock data ────────────────────────────────────────────────────

const BASE = "http://localhost:3001";

const MOCK_DEPARTMENTS = [
  {
    id: "dept-1",
    name: "Electronics",
    description: "Electronic products",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-2",
    name: "Clothing",
    description: "Apparel and clothing",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

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
    server.use(
      http.get(`${BASE}/api/departments`, () =>
        HttpResponse.json({
          statusCode: 200,
          message: "OK",
          data: {
            items: MOCK_DEPARTMENTS,
            total: MOCK_DEPARTMENTS.length,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        }),
      ),
    );
  });

  it("renders the page header with title", () => {
    render(<DepartmentsModule />, { wrapper: createWrapper() });
    expect(screen.getByText("Departments")).toBeInTheDocument();
  });

  it("shows department names after loading", async () => {
    render(<DepartmentsModule />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
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
    // Find delete buttons (one per row) — Safe: waitFor above guarantees rows are rendered
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    // Safe: MOCK_DEPARTMENTS has 2 items so deleteButtons[0] is guaranteed to exist
    const firstDeleteButton = deleteButtons[0]!;
    await user.click(firstDeleteButton);
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });
});
