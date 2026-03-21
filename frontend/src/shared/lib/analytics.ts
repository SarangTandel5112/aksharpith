"use client";

import type { Properties } from "posthog-js";
import posthog from "posthog-js";

// ── Init ──────────────────────────────────────────────────────────────────────

export function initAnalytics(apiKey: string): void {
  if (typeof window === "undefined") return;
  if (posthog.__loaded) return;

  posthog.init(apiKey, {
    api_host: "https://app.posthog.com",
    autocapture: false, // explicit events only
    capture_pageview: false, // fire manually
    capture_pageleave: false,
    disable_session_recording: true,
    sanitize_properties: sanitizeProperties,
  });
}

// ── PII sanitizer ─────────────────────────────────────────────────────────────

function sanitizeProperties(
  properties: Properties,
  _eventName: string,
): Properties {
  const PII_KEYS = new Set([
    "email",
    "name",
    "phone",
    "$email",
    "$name",
    "$phone",
  ]);
  const result: Properties = {};
  for (const [k, v] of Object.entries(properties)) {
    result[k] = PII_KEYS.has(k) ? "[REDACTED]" : v;
  }
  return result;
}

// ── Identity ──────────────────────────────────────────────────────────────────

export function identifyUser(
  userId: string,
  organizationId: string,
): void {
  posthog.identify(userId, {
    organization_id: organizationId,
    // Never send PII (email, name) to PostHog
  });
}
