import { cn } from "@shared/lib/utils";
import type React from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard(props: SectionCardProps): React.JSX.Element {
  return (
    <section
      className={cn(
        "rounded-[1.25rem] border border-zinc-200 bg-white p-5 shadow-sm",
        props.className,
      )}
    >
      <div className="mb-4 space-y-1 border-b border-zinc-100 pb-4">
        <h2 className="text-sm font-semibold tracking-[0.04em] text-zinc-950">
          {props.title}
        </h2>
        {props.description && (
          <p className="text-sm leading-6 text-zinc-500">{props.description}</p>
        )}
      </div>
      <div className="space-y-4">{props.children}</div>
    </section>
  );
}
