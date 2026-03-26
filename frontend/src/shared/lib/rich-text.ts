const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "a",
] as const;

const ALLOWED_TAG_SET = new Set<string>(ALLOWED_TAGS);

const TAG_ALIASES: Record<string, string> = {
  b: "strong",
  i: "em",
  div: "p",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractAttribute(
  attributeSource: string,
  attributeName: string,
): string | null {
  const matcher = new RegExp(
    `${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\\x60]+))`,
    "i",
  );
  const match = attributeSource.match(matcher);

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function sanitizeHref(value: string | null): string | null {
  if (!value) return null;

  const nextValue = value.trim();
  if (nextValue.length === 0) return null;

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(nextValue)) {
    return `https://${nextValue}`;
  }

  if (/^(https?:|mailto:|tel:|\/|#)/i.test(nextValue)) {
    return nextValue;
  }

  return null;
}

function serializeTag(
  isClosing: boolean,
  rawTagName: string,
  attributeSource: string,
): string {
  const normalizedTagName = TAG_ALIASES[rawTagName] ?? rawTagName;

  if (!ALLOWED_TAG_SET.has(normalizedTagName)) {
    return "";
  }

  if (normalizedTagName === "br") {
    return isClosing ? "" : "<br>";
  }

  if (isClosing) {
    return `</${normalizedTagName}>`;
  }

  if (normalizedTagName === "a") {
    const href = sanitizeHref(extractAttribute(attributeSource, "href"));

    if (!href) {
      return "<a>";
    }

    const escapedHref = escapeHtml(href);

    if (/^https?:/i.test(href)) {
      return `<a href="${escapedHref}" target="_blank" rel="noreferrer noopener">`;
    }

    return `<a href="${escapedHref}">`;
  }

  return `<${normalizedTagName}>`;
}

function stripDangerousMarkup(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*\/?\s*>/gi, "");
}

export function sanitizeRichTextHtml(value: string | null | undefined): string {
  if (!value) return "";

  return stripDangerousMarkup(value)
    .replace(
      /<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>/gi,
      (_match, closingSlash: string, rawTagName: string, attributeSource: string) =>
        serializeTag(
          closingSlash === "/",
          rawTagName.toLowerCase(),
          attributeSource,
        ),
    )
    .trim();
}

export function plainTextFromRichText(
  value: string | null | undefined,
): string {
  const sanitized = sanitizeRichTextHtml(value);

  return sanitized
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|blockquote|h1|h2|h3)>/gi, " ")
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
