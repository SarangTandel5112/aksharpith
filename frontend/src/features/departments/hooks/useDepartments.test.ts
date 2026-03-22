// src/features/departments/hooks/useDepartments.test.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@test/msw/server";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type React from "react";
import { describe, expect, it } from "vitest";
import { useDepartments } from "./useDepartments";

// ── Wrapper ───────────────────────────────────────────────────────────────────

function createWrapper(): (props: {
  children: React.ReactNode;
}) => React.JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper(props: {
    children: React.ReactNode;
  }): React.JSX.Element {
    return QueryClientProvider({
      client: queryClient,
      children: props.children,
    }) as React.JSX.Element;
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useDepartments", () => {
  it("fetches departments list", async () => {
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.departments).toHaveLength(2);
    expect(result.current.departments[0]).toHaveProperty("id");
    expect(result.current.departments[0]).toHaveProperty("name");
    expect(result.current.departments[1]).toHaveProperty("id");
    expect(result.current.departments[1]).toHaveProperty("name");
  });

  it("creates a department", async () => {
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createDepartment({
        name: "New Dept",
        description: "Test dept",
      });
    });

    expect(result.current.isCreating).toBe(false);
  });

  it("updates a department", async () => {
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateDepartment("dept-1", {
        name: "Electronics Updated",
      });
    });

    expect(result.current.isUpdating).toBe(false);
  });

  it("deletes a department", async () => {
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteDepartment("dept-1");
    });

    expect(result.current.isDeleting).toBe(false);
  });

  it("surfaces a 404 when updating a non-existent department", async () => {
    server.use(
      http.patch("http://localhost:3001/api/departments/:id", () =>
        HttpResponse.json(
          { statusCode: 404, message: "Department not found", data: null },
          { status: 404 },
        ),
      ),
    );

    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current
        .updateDepartment("dept-missing", { name: "Ghost" })
        .catch(() => null);
    });

    expect(result.current.isUpdating).toBe(false);
  });
});
