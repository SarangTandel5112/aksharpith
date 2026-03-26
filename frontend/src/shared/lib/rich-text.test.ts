import { describe, expect, it } from "vitest";
import {
  normalizeRichTextHtml,
  plainTextFromRichText,
  sanitizeRichTextHtml,
} from "./rich-text";

describe("sanitizeRichTextHtml", () => {
  it("preserves supported heading and emphasis tags", () => {
    expect(
      sanitizeRichTextHtml(
        '<h2 onclick="alert(1)">Title</h2><p><strong>Bold</strong> copy.</p>',
      ),
    ).toBe("<h2>Title</h2><p><strong>Bold</strong> copy.</p>");
  });

  it("strips dangerous tags and unsafe link protocols", () => {
    expect(
      sanitizeRichTextHtml(
        '<script>alert(1)</script><p><a href="javascript:alert(1)">Bad</a> <a href="https://example.com" onclick="x()">Good</a></p>',
      ),
    ).toBe(
      '<p><a>Bad</a> <a href="https://example.com" target="_blank" rel="noreferrer noopener">Good</a></p>',
    );
  });
});

describe("plainTextFromRichText", () => {
  it("returns readable text for headings, lists, and links", () => {
    expect(
      plainTextFromRichText(
        "<h1>Overview</h1><p>Line one</p><ul><li>Alpha</li><li>Beta</li></ul>",
      ),
    ).toBe("Overview Line one Alpha Beta");
  });
});

describe("normalizeRichTextHtml", () => {
  it("returns an empty string when markup has no text content", () => {
    expect(normalizeRichTextHtml("<h2><br></h2>")).toBe("");
  });
});
