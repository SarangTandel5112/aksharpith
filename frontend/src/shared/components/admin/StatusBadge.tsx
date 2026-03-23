import { cn } from "@shared/lib/utils";
import type React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  className?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DOT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-zinc-400",
};

const TEXT_CLASSES: Record<StatusVariant, string> = {
  success: "text-emerald-700 bg-emerald-50",
  warning: "text-amber-700 bg-amber-50",
  danger: "text-red-700 bg-red-50",
  info: "text-blue-700 bg-blue-50",
  neutral: "text-zinc-600 bg-zinc-100",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function StatusBadge(props: StatusBadgeProps): React.JSX.Element {
  const variant = props.variant ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        TEXT_CLASSES[variant],
        props.className,
      )}
    >
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", DOT_CLASSES[variant])}
      />
      {props.label}
    </span>
  );
}
