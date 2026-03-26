import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPageClient } from "./LoginPageClient";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { getSession, signIn } from "next-auth/react";

const mockSignIn = vi.mocked(signIn);
const mockGetSession = vi.mocked(getSession);

describe("LoginPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { role: { name: "Viewer" } },
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as never);
  });
  it("renders the heading and form fields", () => {
    render(<LoginPageClient />);
    expect(screen.getByText(/aksharpith catalog/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("calls signIn with credentials on valid form submit", async () => {
    mockSignIn.mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: null,
    });
    const user = userEvent.setup();

    render(<LoginPageClient />);
    await user.type(screen.getByLabelText(/email/i), "admin@test.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "admin@test.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("redirects viewers to /unauthorized on successful login", async () => {
    mockSignIn.mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: null,
    });
    const user = userEvent.setup();

    render(<LoginPageClient />);
    await user.type(screen.getByLabelText(/email/i), "admin@test.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/unauthorized");
    });
  });

  it("shows error message when login fails", async () => {
    mockSignIn.mockResolvedValue({
      error: "CredentialsSignin",
      ok: false,
      status: 401,
      url: null,
    });
    const user = userEvent.setup();

    render(<LoginPageClient />);
    await user.type(screen.getByLabelText(/email/i), "admin@test.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i),
      ).toBeInTheDocument();
    });
  });
});
