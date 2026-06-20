export interface RecruiterSummaryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  totalOffers: number;
  activeOffers: number;
  pendingApprovals: number;
  expiringOffers: number;
  stalledCandidates: number;
  hireCount: number;
  acceptanceRate: number;
  approvalSuccessRate: number;
  conversionRate: number;
  avgTurnaroundDays: number;
}

export interface RecruiterCandidateSummary {
  id: string;
  fullName: string;
  status: string;
  role: string;
  department: string;
  location: string;
  createdAt: string;
}

export interface RecruiterOfferSummary {
  id: string;
  title: string;
  designation: string;
  status: string;
  totalCtc: number;
  candidateName: string;
  offerDate: string;
  validUntil: string;
}

export interface RecruiterMonthlyPerformanceItem {
  month: string;
  offersCreated: number;
  offersAccepted: number;
  hires: number;
}

export interface RecruiterActivityItem {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  label: string;
  entityType: 'offer' | 'candidate' | 'template' | 'system';
}

export interface RecruiterDetail {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  totalOffers: number;
  activeOffers: number;
  pendingApprovals: number;
  expiringOffers: number;
  stalledCandidates: number;
  hireCount: number;
  acceptanceRate: number;
  approvalSuccessRate: number;
  conversionRate: number;
  avgTurnaroundDays: number;
  ownedCandidates: RecruiterCandidateSummary[];
  ownedOffers: RecruiterOfferSummary[];
  recentActivity: RecruiterActivityItem[];
  monthlyPerformance: RecruiterMonthlyPerformanceItem[];
}

export interface RecruiterListResponse {
  data: RecruiterSummaryItem[];
}

export interface RecruiterDetailResponse {
  data: RecruiterDetail | null;
}
