"use strict";

module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/pos/checkout",
        "http://localhost:3000/pos/catalog",
      ],
      numberOfRuns: 3,
      settings: {
        // 4G tablet simulation — §57
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 2,
        },
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1280,
          height: 800,
          deviceScaleFactor: 1,
          disabled: false,
        },
        // Skip auth — use CI service worker trick instead
        extraHeaders: {
          Authorization: "Bearer $LHCI_TOKEN",
        },
      },
    },
    assert: {
      assertions: {
        // §57 — POS-specific thresholds
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        // Core Web Vitals — POS terminals stay on page, LCP matters
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        // PWA requirements
        "installable-manifest": ["warn", { minScore: 1 }],
        "service-worker": ["warn", { minScore: 1 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
