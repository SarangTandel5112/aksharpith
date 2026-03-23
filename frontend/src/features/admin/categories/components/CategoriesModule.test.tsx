import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@test/msw/server";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { CategoriesModule } from "./CategoriesModule";

// ── Deterministic mock data ────────────────────────────────────────────────────

const BASE = "http://localhost:3000";

const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Phones",
    description: "Mobile phones",
    department: { id: "dept-1", name: "Electronics" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Shirts",
    description: null,
    department: { id: "dept-2", name: "Clothing" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const MOCK_DEPARTMENTS = [
  {
    id: "dept-1",
    name: "Electronics",
    description: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-2",
    name: "Clothing",
    description: null,
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

describe("CategoriesModule", () => {
  beforeEach(() => {
    server.use(
      http.get(`${BASE}/api/categories`, () =>
        HttpResponse.json({
          statusCode: 200,
          message: "OK",
          data: {
            items: MOCK_CATEGORIES,
            total: MOCK_CATEGORIES.length,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        }),
      ),
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
    render(<CategoriesModule />, { wrapper: createWrapper() });
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("shows category names after loading", async () => {
    render(<CategoriesModule />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("Phones")).toBeInTheDocument();
      expect(screen.getByText("Shirts")).toBeInTheDocument();
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
    await waitFor(() => expect(screen.getByText("Phones")).toBeInTheDocument());
    // Find delete buttons (one per row) — Safe: waitFor above guarantees rows are rendered
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    // Safe: MOCK_CATEGORIES has 2 items so deleteButtons[0] is guaranteed to exist
    const firstDeleteButton = deleteButtons[0]!;
    await user.click(firstDeleteButton);
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });
});
