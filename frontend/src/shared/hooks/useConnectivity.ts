"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ConnectivityState = {
  isOnline: boolean;
  lastCheckedAt: Date | null;
  isChecking: boolean;
};

const PROBE_INTERVAL_MS = 30_000; // check every 30 seconds
const PROBE_TIMEOUT_MS = 5_000; // 5 second timeout per probe
const PROBE_PATH = "/api/health";

async function probeConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    const response = await fetch(PROBE_PATH, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export function useConnectivity(): ConnectivityState {
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  // useCallback exception: stable ref required as useEffect dependency
  const check = useCallback(async (): Promise<void> => {
    setIsChecking(true);
    const online = await probeConnectivity();
    setIsOnline(online);
    setLastCheckedAt(new Date());
    setIsChecking(false);
  }, []);

  useEffect(() => {
    // Initial check
    check();

    // Periodic probe
    intervalRef.current = setInterval(check, PROBE_INTERVAL_MS);

    // Also check on browser online/offline events as a fast signal
    const handleOnline = (): void => {
      check();
    };
    const handleOffline = (): void => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [check]);

  return { isOnline, lastCheckedAt, isChecking };
}
