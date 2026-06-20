export interface DashboardStatusDistributionItem {
  name: string;
  value: number;
}

export interface DashboardActivityItem {
  id: string;
  action: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

export interface DashboardPipelineItem {
  stage: string;
  count: number;
}

export interface DashboardMonthlyHiringItem {
  month: string;
  hires: number;
}

export interface DepartmentAnalyticsItem {
  department: string;
  offers: number;
  accepted: number;
  avgCtc: number;
}

export interface CompensationAnalytics {
  avgCtc: number;
  highestCtc: number;
  lowestCtc: number;
  totalBudget: number;
}

export interface RecruiterPerformanceItem {
  recruiterName: string;
  offersCreated: number;
  offersAccepted: number;
  acceptanceRate: number;
  approvalSuccessRate: number;
  candidateConversionRate: number;
  avgTurnaroundDays: number;
  hireCount: number;
}

export interface DashboardStats {
  totalOffers: number;
  pendingApprovals: number;
  acceptedOffers: number;
  activeCandidates: number;
  statusDistribution: DashboardStatusDistributionItem[];
  recentActivities: DashboardActivityItem[];
  candidatePipeline: DashboardPipelineItem[];
  monthlyHiring: DashboardMonthlyHiringItem[];
  departmentAnalytics: DepartmentAnalyticsItem[];
  compensationAnalytics: CompensationAnalytics;
  recruiterLeaderboard: RecruiterPerformanceItem[];
}
