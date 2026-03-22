import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usersHandlers } from "@test/msw/handlers/users.handlers";
import { server } from "@test/msw/server";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { UsersModule } from "./UsersModule";

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

describe("UsersModule", () => {
  beforeEach(() => {
    server.use(...usersHandlers);
  });

  it("shows skeleton rows while loading", () => {
    render(<UsersModule />, { wrapper: makeWrapper() });
    expect(screen.getAllByTestId("skeleton-row").length).toBeGreaterThan(0);
  });

  it("renders user rows after data loads", async () => {
    render(<UsersModule />, { wrapper: makeWrapper() });
    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument(),
    );
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it('opens add dialog on "Add User" click', async () => {
    render(<UsersModule />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getByText("Add User"));
    await userEvent.click(screen.getByText("Add User"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens edit dialog with user data pre-populated", async () => {
    render(<UsersModule />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getAllByRole("button", { name: /edit/i }));
    // Safe: getAllByRole throws if empty, so index [0] is always defined
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const input = screen.getByDisplayValue("John");
    expect(input).toBeInTheDocument();
  });
});
