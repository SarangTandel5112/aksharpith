"use client";

import { getQueryClient } from "@shared/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import type { ReactNode } from "react";

export function QueryProvider(props: {
  children: ReactNode;
}): React.JSX.Element {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
  );
}
