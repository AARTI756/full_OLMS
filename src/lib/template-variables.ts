import type { OfferDetail } from "@/types/offer";
import { formatCurrency } from "@/lib/utils";

export type TemplateRenderContext = Record<string, string>;

export const TEMPLATE_VARIABLES = [
  { key: "candidateName", label: "Candidate name" },
  { key: "candidateEmail", label: "Candidate email" },
  { key: "candidatePhone", label: "Candidate phone" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "joiningDate", label: "Joining date" },
  { key: "ctc", label: "CTC" },
  { key: "totalCtc", label: "Total CTC" },
  { key: "managerName", label: "Manager name" },
  { key: "companyName", label: "Company name" },
  { key: "offerTitle", label: "Offer title" },
  { key: "offerDate", label: "Offer date" },
  { key: "validUntil", label: "Valid until" },
  { key: "approvalComments", label: "Approval comments" },
];

export const DEFAULT_TEMPLATE_PREVIEW_CONTEXT: TemplateRenderContext = {
  candidateName: "Mina Patel",
  candidateEmail: "mina.patel@example.com",
  candidatePhone: "+1 (555) 312-8901",
  designation: "Senior Backend Engineer",
  department: "Engineering",
  joiningDate: "September 15, 2026",
  ctc: "$120,000",
  totalCtc: "$120,000",
  managerName: "Ayesha Khan",
  companyName: "Acme Corporation",
  offerTitle: "Senior Backend Offer",
  offerDate: "August 1, 2026",
  validUntil: "September 1, 2026",
  approvalComments: "Pending final review from recruiting team.",
};

export function buildTemplateRenderContextFromOffer(offer: OfferDetail, companyName = "Acme Corporation"): TemplateRenderContext {
  const formattedSalary = formatCurrency(offer.totalCtc);
  return {
    candidateName: offer.candidateName,
    candidateEmail: offer.candidateEmail,
    candidatePhone: offer.candidatePhone,
    designation: offer.designation,
    department: offer.departmentName,
    joiningDate: new Date(offer.offerDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    ctc: formattedSalary,
    totalCtc: formattedSalary,
    managerName: "Hiring manager",
    companyName,
    offerTitle: offer.title,
    offerDate: new Date(offer.offerDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    validUntil: new Date(offer.validUntil).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    approvalComments: offer.approvalComments ?? "Awaiting approval comments.",
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseTemplatePlaceholders(content: string) {
  const keys = new Set<string>();
  const matcher = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  let match;

  while ((match = matcher.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return Array.from(keys);
}

export function renderTemplateContent(content: string, context: TemplateRenderContext = DEFAULT_TEMPLATE_PREVIEW_CONTEXT) {
  return parseTemplatePlaceholders(content).reduce((html, key) => {
    const value = context[key] ?? `[${key} not set]`;
    return html.replace(new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, "gi"), value);
  }, content);
}
