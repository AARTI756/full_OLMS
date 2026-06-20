export type CandidateSortBy = "createdAt" | "fullName" | "expectedCtc" | "status";
export type SortOrder = "asc" | "desc";

export interface CandidateListFilters {
  search: string;
  status: string;
  department: string;
  recruiter?: string;
  page: number;
  sortBy: CandidateSortBy;
  sortOrder: SortOrder;
}

export interface CandidateListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  experienceYears: number;
  expectedCtc: number;
  currentCtc: number;
  noticePeriodDays: number;
  status: string;
  recruiterName?: string | null;
  location: string;
  skills: string[];
  latestResumeUrl?: string | null;
}

export interface CandidateListResponse {
  data: CandidateListItem[];
  total: number;
}

export interface CandidateResumeItem {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CandidateNoteItem {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateActivityItem {
  id: string;
  action: string;
  details: string;
  userName: string;
  createdAt: string;
}

export interface CandidateOfferSummary {
  id: string;
  title: string;
  status: string;
  version: number;
  offerDate: string;
}

export interface CandidateDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  experienceYears: number;
  expectedCtc: number;
  currentCtc: number;
  noticePeriodDays: number;
  status: string;
  recruiterName?: string | null;
  location: string;
  skills: string[];
  resumeUrl?: string | null;
  notes?: string | null;
  resumes: CandidateResumeItem[];
  offerHistory: CandidateOfferSummary[];
}
