import type { Event } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";
import { beforeSend, scrubPII } from "./sentry";

describe("scrubPII", () => {
  it("redacts card numbers in strings", () => {
    expect(scrubPII("card: 4111111111111111")).toBe("card: [REDACTED]");
  });

  it("redacts email addresses", () => {
    expect(scrubPII("contact user@example.com now")).toBe(
      "contact [REDACTED] now",
    );
  });

  it("redacts known PII keys in objects", () => {
    const result = scrubPII({
      orderId: "ord_001",
      card_number: "4111111111111111",
      amount: 5000,
    });
    expect((result as Record<string, unknown>)["card_number"]).toBe(
      "[REDACTED]",
    );
    expect((result as Record<string, unknown>)["orderId"]).toBe("ord_001");
    expect((result as Record<string, unknown>)["amount"]).toBe(5000);
  });

  it("redacts nested PII", () => {
    const result = scrubPII({
      payment: { cardNumber: "4111111111111111", amount: 5000 },
    }) as Record<string, Record<string, unknown>>;
    expect(result["payment"]?.["cardNumber"]).toBe("[REDACTED]");
    expect(result["payment"]?.["amount"]).toBe(5000);
  });

  it("handles arrays", () => {
    const result = scrubPII(["hello", "user@test.com"]) as string[];
    expect(result[1]).toBe("[REDACTED]");
  });

  it("passes through non-PII values unchanged", () => {
    expect(scrubPII(42)).toBe(42);
    expect(scrubPII(null)).toBeNull();
    expect(scrubPII({ amount: 100 })).toEqual({ amount: 100 });
  });
});

describe("beforeSend", () => {
  it("scrubs request body in Sentry event", () => {
    const event: Event = {
      request: {
        data: { card_number: "4111111111111111", orderId: "ord_001" },
      },
    };
    const result = beforeSend(event, {} as never);
    expect(
      (result?.request?.data as Record<string, unknown>)?.["card_number"],
    ).toBe("[REDACTED]");
    expect(
      (result?.request?.data as Record<string, unknown>)?.["orderId"],
    ).toBe("ord_001");
  });

  it("returns the event (does not drop it)", () => {
    const event: Event = { message: "test error" };
    expect(beforeSend(event, {} as never)).not.toBeNull();
  });
});
