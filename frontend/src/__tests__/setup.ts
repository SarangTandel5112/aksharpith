import "fake-indexeddb/auto";
import "@testing-library/jest-dom";
import { server } from "./msw/server";

// ── MSW lifecycle ──────────────────────────────────────────────────────────────

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Browser API stubs (required by happy-dom, skipped in node environment) ────

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    }),
  });

  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof IntersectionObserver;

  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof ResizeObserver;
}

// ── crypto.randomUUID fallback ─────────────────────────────────────────────────

if (typeof crypto.randomUUID !== "function") {
  Object.defineProperty(crypto, "randomUUID", {
    value: (): string => {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      // Safe: bytes is a Uint8Array(16) — indices 6 and 8 are always defined
      bytes[6] = (bytes[6]! & 0x0f) | 0x40;
      // Safe: bytes is a Uint8Array(16) — indices 6 and 8 are always defined
      bytes[8] = (bytes[8]! & 0x3f) | 0x80;
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    },
  });
}

// ── Next.js stubs ──────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/pos/checkout",
  useParams: () => ({}),
}));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-trace-id", "test-trace-id"]]),
  cookies: () => new Map(),
}));
