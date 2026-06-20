import { describe, expect, it } from "vitest";
import { buildTemplatePdfHtml, getTemplatePdfFileName } from "@/lib/pdf";
import { DEFAULT_TEMPLATE_PREVIEW_CONTEXT } from "@/lib/template-variables";

describe("PDF utilities", () => {
  it("generates valid A4 HTML with template content", () => {
    const content = "<p>Hello, {{candidateName}}.</p>";
    const html = buildTemplatePdfHtml(content, DEFAULT_TEMPLATE_PREVIEW_CONTEXT, "Offer letter");

    expect(html).toContain("@page");
    expect(html).toContain("A4");
    expect(html).toContain("Offer letter");
    expect(html).toContain(content);
  });

  it("builds a safe PDF filename from a template title", () => {
    expect(getTemplatePdfFileName("Executive Offer Letter")).toBe("offer-template-executive-offer-letter.pdf");
    expect(getTemplatePdfFileName("  !Special Offer / 2026  ")).toBe("offer-template-special-offer-2026.pdf");
    expect(getTemplatePdfFileName("")).toBe("offer-template-document.pdf");
  });
});
