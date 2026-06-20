export type ApprovalDecision = "PENDING" | "APPROVED" | "REJECTED";

export interface ApprovalListFilters {
  status?: ApprovalDecision | "";
  page?: number;
  limit?: number;
}

export interface ApprovalListItem {
  id: string;
  offerId: string;
  offerTitle: string;
  stage: string;
  status: string;
  approverId: string;
  approverName: string;
  due: string;
  decidedAt?: string | null;
}

export interface ApprovalListResponse {
  data: ApprovalListItem[];
  total: number;
}
