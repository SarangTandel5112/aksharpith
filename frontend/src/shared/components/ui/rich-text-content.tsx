"use client";

import { cn } from "@shared/lib/utils";
import { normalizeRichTextHtml } from "@shared/lib/rich-text";
import type React from "react";

type RichTextContentProps = {
  value: string | null | undefined;
  className?: string;
};

export function RichTextContent(
  props: RichTextContentProps,
): React.JSX.Element | null {
  const html = normalizeRichTextHtml(props.value);

  if (!html) return null;

  return (
    <div
      className={cn(
        "text-sm leading-7 text-zinc-700 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        props.className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
