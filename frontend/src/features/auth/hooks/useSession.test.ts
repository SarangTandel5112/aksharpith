import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "./useSession";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

import { useSession as useNextAuthSession } from "next-auth/react";

const mockUseNextAuthSession = vi.mocked(useNextAuthSession);

const fakeUser = {
  id: "user-1",
  email: "test@test.com",
  username: "test.user",
  firstName: "Test",
  middleName: null,
  lastName: "User",
  roleId: 1,
  role: { id: 1, name: "Admin", isActive: true },
};

describe("useSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns loading when next-auth is loading", () => {
    mockUseNextAuthSession.mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });

    const { result } = renderHook(() => useSession());

    expect(result.current.status).toBe("loading");
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it("returns unauthenticated when there is no session", () => {
    mockUseNextAuthSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    const { result } = renderHook(() => useSession());

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it("returns authenticated with user and accessToken", () => {
    mockUseNextAuthSession.mockReturnValue({
      data: {
        user: fakeUser,
        accessToken: "token-abc",
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    const { result } = renderHook(() => useSession());

    expect(result.current.status).toBe("authenticated");
    if (result.current.status === "authenticated") {
      expect(result.current.user.email).toBe("test@test.com");
      expect(result.current.accessToken).toBe("token-abc");
    }
  });
});
