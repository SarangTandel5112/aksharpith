import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
] as const;

const ALLOWED_ATTR: string[] = [];

export function sanitizeRichTextHtml(value: string | null | undefined): string {
  if (!value) return "";

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR,
    FORBID_TAGS: ["style", "script"],
  }).trim();
}

export function plainTextFromRichText(
  value: string | null | undefined,
): string {
  const sanitized = sanitizeRichTextHtml(value);

  return sanitized
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasRichTextContent(value: string | null | undefined): boolean {
  return plainTextFromRichText(value).length > 0;
}

export function normalizeRichTextHtml(
  value: string | null | undefined,
): string {
  const sanitized = sanitizeRichTextHtml(value);
  return hasRichTextContent(sanitized) ? sanitized : "";
}
