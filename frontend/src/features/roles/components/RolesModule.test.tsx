import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { rolesHandlers } from "@test/msw/handlers/roles.handlers";
import { server } from "@test/msw/server";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { RolesModule } from "./RolesModule";

// ── Wrapper ────────────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper(props: {
    children: React.ReactNode;
  }): React.JSX.Element {
    return (
      <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
    );
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("RolesModule", () => {
  beforeEach(() => {
    server.use(...rolesHandlers);
  });

  it("shows skeleton rows while loading", () => {
    render(<RolesModule />, { wrapper: makeWrapper() });
    expect(screen.getAllByTestId("skeleton-row").length).toBeGreaterThan(0);
  });

  it("renders role rows after data loads", async () => {
    render(<RolesModule />, { wrapper: makeWrapper() });
    await waitFor(() =>
      expect(screen.getByText("Admin")).toBeInTheDocument(),
    );
    expect(screen.getByText("Staff")).toBeInTheDocument();
  });

  it('opens create dialog on "Add Role" click', async () => {
    render(<RolesModule />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getByText("Add Role"));
    await userEvent.click(screen.getByText("Add Role"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens edit dialog with role data pre-populated", async () => {
    render(<RolesModule />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getAllByRole("button", { name: /edit/i }));
    // Safe: getAllByRole throws if empty, so index [0] is always defined
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const input = screen.getByDisplayValue("Admin");
    expect(input).toBeInTheDocument();
  });
});
