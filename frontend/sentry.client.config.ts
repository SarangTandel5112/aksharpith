import type { ErrorEvent, EventHint } from "@sentry/nextjs";
import * as Sentry from "@sentry/nextjs";
import { beforeSend as scrubBeforeSend } from "@shared/lib/sentry";

// Sentry v10 beforeSend is typed as ErrorEvent (not the generic Event).
// Our scrubber accepts Event (supertype) — the cast is safe because
// ErrorEvent extends Event, and we return the same object or null.
function beforeSendWrapper(
  event: ErrorEvent,
  hint: EventHint,
): ErrorEvent | null {
  return scrubBeforeSend(event, hint) as ErrorEvent | null;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend: beforeSendWrapper,
  // Never send PII — confirmed by beforeSend scrubber
  sendDefaultPii: false,
});
