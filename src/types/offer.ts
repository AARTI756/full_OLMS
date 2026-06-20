export type OfferSortBy = "offerDate" | "validUntil" | "totalCtc" | "status" | "title";
export type SortOrder = "asc" | "desc";

export interface OfferListFilters {
  search: string;
  status: string;
  department: string;
  recruiter?: string;
  page: number;
  sortBy: OfferSortBy;
  sortOrder: SortOrder;
}

export interface OfferListItem {
  id: string;
  title: string;
  department: string;
  designation: string;
  status: string;
  totalCtc: number;
  offerDate: string;
  validUntil: string;
  candidateName: string;
  version: number;
}

export interface OfferListResponse {
  data: OfferListItem[];
  total: number;
}

export interface OfferCompensation {
  baseSalary: number;
  variablePay: number;
  joiningBonus: number;
  retentionBonus: number;
  totalCtc: number;
  grossAnnual: number;
  netAnnual: number;
}

export interface OfferApprovalSummary {
  id: string;
  decision: string;
  comments?: string | null;
  approverName: string;
  decidedAt?: string | null;
}

export interface OfferDetail {
  id: string;
  title: string;
  department: string;
  designation: string;
  status: string;
  baseSalary: number;
  variablePay: number;
  joiningBonus: number;
  retentionBonus: number;
  probationPeriodMonths: number;
  offerDate: string;
  validUntil: string;
  totalCtc: number;
  version: number;
  approvalComments?: string | null;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  departmentName: string;
  templateId?: string | null;
  templateVersionId?: string | null;
  templateTitle?: string | null;
  createdByEmail?: string | null;
  createdByName?: string | null;
  approvals: OfferApprovalSummary[];
}
