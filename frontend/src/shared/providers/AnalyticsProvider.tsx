"use client";

import { env } from "@config/env";
import { initAnalytics } from "@shared/lib/analytics";
import { useEffect } from "react";

export function AnalyticsProvider(props: {
  children: React.ReactNode;
}): React.JSX.Element {
  useEffect(() => {
    if (env.NEXT_PUBLIC_POSTHOG_KEY) {
      initAnalytics(env.NEXT_PUBLIC_POSTHOG_KEY);
    }
  }, []);

  return <>{props.children}</>;
}
