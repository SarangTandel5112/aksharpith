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
        "text-sm leading-7 text-zinc-700 [&_a]:font-medium [&_a]:text-zinc-900 [&_a]:underline [&_a]:decoration-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        props.className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitized via DOMPurify in normalizeRichTextHtml.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
