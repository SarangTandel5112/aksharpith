"use client";

import { useEffect, useState } from "react";

type MockProductResourceState<T> = {
  data: T | null;
  isLoading: boolean;
};

export function useMockProductResource<T>(
  productId: number | null,
  loader: (productId: number) => T,
): MockProductResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      setData(loader(productId));
      setIsLoading(false);
    }, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [productId]);

  return { data, isLoading };
}
