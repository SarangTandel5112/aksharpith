import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock posthog-js before importing analytics
vi.mock("posthog-js", () => ({
  default: {
    __loaded: false,
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
  },
}));

import posthog from "posthog-js";
import { identifyUser } from "./analytics";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("identifyUser", () => {
  it("identifies user without PII", () => {
    identifyUser("user_001", "org_001");
    expect(posthog.identify).toHaveBeenCalledWith(
      "user_001",
      expect.objectContaining({ organization_id: "org_001" }),
    );
    const call = vi.mocked(posthog.identify).mock.calls[0];
    const props = call?.[1] as Record<string, unknown>;
    expect(props).not.toHaveProperty("email");
    expect(props).not.toHaveProperty("name");
  });
});
