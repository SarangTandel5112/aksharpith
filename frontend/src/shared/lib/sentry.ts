import type { Event, EventHint } from "@sentry/nextjs";

// ── PII field patterns ────────────────────────────────────────────────────────

const PII_KEYS = new Set([
  "card_number",
  "cardNumber",
  "card_num",
  "cvv",
  "cvc",
  "expiry",
  "expiry_date",
  "pan",
  "track_data",
  "magnetic_stripe",
  "email",
  "phone",
  "mobile",
  "name",
  "full_name",
  "customer_name",
  "aadhaar",
  "pan_card",
  "passport",
  "password",
  "token",
  "secret",
  "api_key",
]);

const PII_PATTERNS: RegExp[] = [
  /\b\d{13,19}\b/g, // card number
  /\b\d{3,4}\b/g, // CVV (context-dependent)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g, // email
  /\b[6-9]\d{9}\b/g, // Indian mobile number
];

const REDACTED = "[REDACTED]";

// ── Scrubber ──────────────────────────────────────────────────────────────────

export function scrubPII(value: unknown): unknown {
  if (typeof value === "string") {
    let scrubbed = value;
    for (const pattern of PII_PATTERNS) {
      scrubbed = scrubbed.replace(pattern, REDACTED);
    }
    return scrubbed;
  }

  if (Array.isArray(value)) {
    return value.map(scrubPII);
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = PII_KEYS.has(k.toLowerCase()) ? REDACTED : scrubPII(v);
    }
    return result;
  }

  return value;
}

// ── Sentry beforeSend hook ────────────────────────────────────────────────────

export function beforeSend(event: Event, _hint: EventHint): Event | null {
  // Scrub request body
  if (event.request?.data) {
    event.request.data = scrubPII(
      event.request.data,
    ) as typeof event.request.data;
  }

  // Scrub extra context
  if (event.extra) {
    event.extra = scrubPII(event.extra) as typeof event.extra;
  }

  // Scrub breadcrumb data
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => ({
      ...b,
      ...(b.data ? { data: scrubPII(b.data) as typeof b.data } : {}),
    }));
  }

  return event;
}
