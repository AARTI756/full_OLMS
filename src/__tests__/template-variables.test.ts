import { describe, expect, it } from "vitest";
import { buildTemplateRenderContextFromOffer, DEFAULT_TEMPLATE_PREVIEW_CONTEXT, renderTemplateContent } from "@/lib/template-variables";
import type { OfferDetail } from "@/types/offer";

describe("template variables", () => {
  it("replaces known placeholders in HTML content", () => {
    const content = "<p>Welcome {{candidateName}}. Your offer amount is {{ctc}}.</p>";
    const rendered = renderTemplateContent(content, DEFAULT_TEMPLATE_PREVIEW_CONTEXT);

    expect(rendered).toContain("Welcome");
    expect(rendered).toContain(DEFAULT_TEMPLATE_PREVIEW_CONTEXT.candidateName);
    expect(rendered).toContain(DEFAULT_TEMPLATE_PREVIEW_CONTEXT.ctc);
    expect(rendered).not.toContain("{{candidateName}}");
    expect(rendered).not.toContain("{{ctc}}");
  });

  it('renders unknown placeholders with a fallback marker', () => {
    const content = '<p>Missing field: {{unknownField}}</p>';
    const rendered = renderTemplateContent(content, DEFAULT_TEMPLATE_PREVIEW_CONTEXT);

    expect(rendered).toContain('[unknownField not set]');
  });

  it("builds a render context from an offer object", () => {
    const offer: OfferDetail = {
      id: "offer-1",
      title: "Senior Backend Offer",
      department: "Engineering",
      designation: "Backend Engineer",
      status: "DRAFT",
      baseSalary: 90000,
      variablePay: 10000,
      joiningBonus: 5000,
      retentionBonus: 5000,
      probationPeriodMonths: 3,
      offerDate: "2026-05-01",
      validUntil: "2026-06-01",
      totalCtc: 110000,
      version: 1,
      approvalComments: "Ready for review.",
      candidateId: "candidate-1",
      candidateName: "Jane Doe",
      candidateEmail: "jane.doe@example.com",
      candidatePhone: "+1 (555) 123-4567",
      departmentName: "Engineering",
      templateId: null,
      templateTitle: null,
      approvals: [],
    };

    const context = buildTemplateRenderContextFromOffer(offer);

    expect(context.candidateName).toBe("Jane Doe");
    expect(context.candidateEmail).toBe("jane.doe@example.com");
    expect(context.department).toBe("Engineering");
    expect(context.ctc).toBe("$110,000");
    expect(context.offerDate).toBe("May 1, 2026");
  });
});
