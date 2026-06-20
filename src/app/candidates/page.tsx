'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shared/app-shell";
import { CandidateActivityTimeline } from "@/components/candidates/candidate-activity-timeline";
import { CandidateNotesPanel } from "@/components/candidates/candidate-notes-panel";
import type { CandidateListItem, CandidateSortBy, SortOrder } from "@/types/candidate";
import { useCandidates } from "@/hooks/use-candidates";
import { useCandidateFilterStore } from "@/store/use-candidate-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const statuses = ["", "NEW", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"];
const departments = ["", "Engineering", "HR", "Sales", "Marketing", "Finance"];
const sortOptions: { label: string; value: CandidateSortBy }[] = [
  { label: 'Newest', value: 'createdAt' },
  { label: 'Name', value: 'fullName' },
  { label: 'CTC', value: 'expectedCtc' },
  { label: 'Status', value: 'status' },
];

const statusClasses: Record<string, string> = {
  NEW: "bg-slate-900 text-slate-200",
  SCREENING: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  INTERVIEW: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  OFFERED: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  HIRED: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function CandidateStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] ?? "bg-slate-900 text-slate-200"}`}>
      {status || "Unknown"}
    </span>
  );
}

export default function CandidatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const [previewCandidate, setPreviewCandidate] = useState<CandidateListItem | null>(null);
  const {
    search,
    status,
    department,
    recruiter,
    page,
    sortBy,
    sortOrder,
    setSearch,
    setStatus,
    setDepartment,
    setRecruiter,
    setPage,
    setSortBy,
    setSortOrder,
  } = useCandidateFilterStore();

  useEffect(() => {
    if (initialized) {
      return;
    }

    if (!searchParams) {
      setInitialized(true);
      return;
    }

    const query = searchParams.get('search') ?? '';
    const statusParam = searchParams.get('status') ?? '';
    const departmentParam = searchParams.get('department') ?? '';
    const recruiterParam = searchParams.get('recruiter') ?? '';
    const pageParam = Number(searchParams.get('page') ?? '1');
    const sortByParam = (searchParams.get('sortBy') as CandidateSortBy) ?? 'createdAt';
    const sortOrderParam = (searchParams.get('sortOrder') as SortOrder) ?? 'desc';

    setSearch(query);
    setStatus(statusParam);
    setDepartment(departmentParam);
    setRecruiter(recruiterParam);
    setPage(pageParam);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);
    setInitialized(true);
  }, [initialized, searchParams, setSearch, setStatus, setDepartment, setRecruiter, setPage, setSortBy, setSortOrder]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (department) params.set('department', department);
    if (recruiter) params.set('recruiter', recruiter);
    if (page > 1) params.set('page', String(page));
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    router.replace(url);
  }, [initialized, search, status, department, recruiter, page, sortBy, sortOrder, router, pathname]);

  const { data, isLoading, isError } = useCandidates({ search, status, department, recruiter, page, sortBy, sortOrder });

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total ?? 0) / 12)), [data]);

  const summary = useMemo(() => {
    const candidates = data?.data ?? [];
    const activePipeline = candidates.filter((candidate) => candidate.status !== 'NEW' && candidate.status !== 'REJECTED').length;
    const statusMap = candidates.reduce<Record<string, number>>((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] ?? 0) + 1;
      return acc;
    }, {});

    const recruiterMap = candidates.reduce<Record<string, number>>((acc, candidate) => {
      const key = candidate.recruiterName ?? 'Unassigned';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const topRecruiter = Object.entries(recruiterMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unassigned';
    const averageExperience = candidates.length ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.experienceYears, 0) / candidates.length) : 0;

    return { activePipeline, topRecruiter, statusMap, averageExperience };
  }, [data]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Candidate command center</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Executive recruiting workspace</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Stay ahead of talent movement with fast filters, urgent pipeline signals, and candidate previews crafted for premium recruiting teams.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/candidates/new" className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Add candidate
              </Link>
              <Button variant="secondary" onClick={() => router.refresh()} className="rounded-3xl">
                Refresh view
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Talent pipeline</p>
              <p className="mt-4 text-4xl font-semibold text-white">{data?.total ?? 0}</p>
              <p className="mt-2 text-sm text-slate-500">Candidates in the current filtered workspace</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active movement</p>
              <p className="mt-4 text-4xl font-semibold text-white">{summary.activePipeline}</p>
              <p className="mt-2 text-sm text-slate-500">In screening, interviewing, or offer motion</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Top recruiter</p>
              <p className="mt-4 text-3xl font-semibold text-white">{summary.topRecruiter}</p>
              <p className="mt-2 text-sm text-slate-500">Most active talent owner in view</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Experience signal</p>
              <p className="mt-4 text-4xl font-semibold text-white">{summary.averageExperience} yrs</p>
              <p className="mt-2 text-sm text-slate-500">Average experience across visible candidates</p>
            </motion.div>
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6 shadow-inner">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Filters & workflow</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Productize candidate discovery</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statuses.filter(Boolean).map((statusItem) => (
                      <button
                        key={statusItem}
                        type="button"
                        onClick={() => setStatus(statusItem)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${status === statusItem ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {statusItem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6 shadow-inner">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-40 animate-pulse rounded-[28px] bg-slate-900/80" />
                ))
              ) : isError ? (
                <div className="rounded-[28px] border border-rose-500/10 bg-slate-900/80 p-8 text-center text-slate-400">
                  Unable to load candidates. Refresh or adjust filters to continue.
                </div>
              ) : data?.data.length ? (
                <div className="grid gap-4">
                  {data.data.map((candidate) => (
                    <motion.button
                      key={candidate.id}
                      type="button"
                      onClick={() => router.push(`/candidates/${candidate.id}`)}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5 text-left shadow-[0_10px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 via-slate-900 to-slate-950 text-lg font-semibold text-white shadow-[0_20px_45px_rgba(34,211,238,0.18)]">
                            {getInitials(candidate.fullName)}
                            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black text-slate-950">
                              {candidate.status === 'HIRED' ? 'H' : candidate.status === 'OFFERED' ? 'O' : 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Candidate</p>
                            <p className="mt-1 text-lg font-semibold text-white">{candidate.fullName}</p>
                            <p className="mt-2 text-sm text-slate-400">{candidate.role} • {candidate.department}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:items-end">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[candidate.status] ?? 'bg-slate-900 text-slate-200'}`}>
                            {candidate.status}
                          </span>
                          <span className="text-sm text-slate-400">Owner: {candidate.recruiterName || 'Unassigned'}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:bg-slate-900/95">
                          <p className="text-slate-400">Experience</p>
                          <p className="mt-2 font-semibold text-white">{candidate.experienceYears} yrs</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:bg-slate-900/95">
                          <p className="text-slate-400">Expected CTC</p>
                          <p className="mt-2 font-semibold text-white">${candidate.expectedCtc.toLocaleString()}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:bg-slate-900/95">
                          <p className="text-slate-400">Location</p>
                          <p className="mt-2 font-semibold text-white">{candidate.location}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded-full bg-slate-950/90 px-3 py-1 text-xs text-slate-200">{skill}</span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs text-slate-400">+{candidate.skills.length - 4} more</span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-[28px] border border-slate-800/90 bg-slate-950/80 p-4 text-sm text-slate-400">
                          <div className="flex items-center justify-between gap-3">
                            <span>Onboarding readiness</span>
                            <span className={`rounded-full px-3 py-1 text-xs ${candidate.noticePeriodDays <= 30 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                              {candidate.noticePeriodDays <= 30 ? 'Ready soon' : 'Extended notice'}
                            </span>
                          </div>
                          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.max(20, Math.min(100, 100 - candidate.noticePeriodDays * 2))}%` }} />
                          </div>
                        </div>
                        <div className="rounded-[28px] border border-slate-800/90 bg-slate-950/80 p-4 text-sm text-slate-400">
                          <p className="text-slate-300">Hiring stage</p>
                          <div className="mt-3 grid gap-2">
                            {['NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED'].map((step) => (
                              <div key={step} className={`h-2 rounded-full ${candidate.status === step || (candidate.status === 'HIRED' && step !== 'NEW') ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800/90 pt-4 text-sm text-slate-400">
                        <span>{candidate.latestResumeUrl ? 'Resume available' : 'No resume uploaded'}</span>
                        <Button
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPreviewCandidate(candidate);
                          }}
                          className="rounded-3xl"
                        >
                          Quick preview
                        </Button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-8 text-center text-slate-400">
                  No candidates match these filters. Adjust the search, change sorting, or reset filters to discover more talent.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Showing {data?.data.length ?? 0} of {data?.total ?? 0} candidates</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>Previous</Button>
                  <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</Button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6 shadow-inner">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Pipeline status</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Instant snapshots</h2>
              <div className="mt-6 space-y-4">
                {Object.entries(summary.statusMap).map(([statusKey, count]) => (
                  <div key={statusKey} className="flex items-center justify-between rounded-3xl bg-slate-950/90 px-4 py-3">
                    <span className="text-sm text-slate-300">{statusKey || 'Unspecified'}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">Need attention</p>
                <p className="mt-2 text-lg font-semibold text-white">{status === 'INTERVIEW' ? 'Schedule follow-up interviews' : 'Review recent candidate movement'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-900/90 px-3 py-2 text-xs text-slate-200">Filter page: {page}</span>
                  <span className="rounded-full bg-slate-900/90 px-3 py-2 text-xs text-slate-200">Sort: {sortBy} {sortOrder.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root open={Boolean(previewCandidate)} onOpenChange={(open: boolean) => { if (!open) setPreviewCandidate(null); }}>
        <DialogContent className="left-auto right-0 top-0 -translate-x-0 -translate-y-0 h-full max-h-screen max-w-[760px] rounded-l-[32px] p-0 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <div className="flex h-full flex-col bg-slate-950/95">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-5">
              <div>
                <DialogTitle className="text-xl">Candidate preview</DialogTitle>
                <DialogDescription className="mt-1 text-slate-400">Review the candidate’s profile, resume availability, and pipeline signal before opening the full workspace.</DialogDescription>
              </div>
              <Button variant="ghost" className="rounded-full p-3" onClick={() => setPreviewCandidate(null)}>
                Close
              </Button>
            </div>

            {previewCandidate ? (
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex h-full flex-col overflow-y-auto p-6">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                      <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">{previewCandidate.role} · {previewCandidate.department}</p>
                            <h2 className="mt-3 text-3xl font-semibold text-white">{previewCandidate.fullName}</h2>
                            <p className="mt-2 text-sm text-slate-400">{previewCandidate.email} · {previewCandidate.phone}</p>
                          </div>
                          <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950/90 px-4 py-2 text-sm text-slate-300">
                            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Owner: {previewCandidate.recruiterName || 'Unassigned'}
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-3xl bg-slate-950/90 p-4">
                            <p className="text-sm text-slate-400">Pipeline stage</p>
                            <p className="mt-2 text-xl font-semibold text-white">{previewCandidate.status}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-950/90 p-4">
                            <p className="text-sm text-slate-400">Onboarding readiness</p>
                            <p className="mt-2 text-xl font-semibold text-white">{previewCandidate.noticePeriodDays <= 30 ? 'Ready soon' : 'Extended notice'}</p>
                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(20, Math.min(100, 100 - previewCandidate.noticePeriodDays * 2))}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-5">
                          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Experience</p>
                          <p className="mt-3 text-3xl font-semibold text-white">{previewCandidate.experienceYears} yrs</p>
                          <p className="mt-2 text-sm text-slate-500">Depth of candidate readiness and seniority.</p>
                        </div>
                        <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-5">
                          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Compensation</p>
                          <p className="mt-3 text-3xl font-semibold text-white">${previewCandidate.expectedCtc.toLocaleString()}</p>
                          <p className="mt-2 text-sm text-slate-500">Target package for the hiring plan.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Summary</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-400">
                          <div className="grid gap-2">
                            <span className="text-slate-300">Location</span>
                            <span className="font-semibold text-white">{previewCandidate.location}</span>
                          </div>
                          <div className="grid gap-2">
                            <span className="text-slate-300">Phone</span>
                            <span className="font-semibold text-white">{previewCandidate.phone}</span>
                          </div>
                          <div className="grid gap-2">
                            <span className="text-slate-300">Resume</span>
                            <span className="font-semibold text-white">{previewCandidate.latestResumeUrl ? 'Available' : 'Not uploaded'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Skills</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {previewCandidate.skills.length ? previewCandidate.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-slate-950/90 px-3 py-1 text-sm text-slate-200">{skill}</span>
                          )) : (
                            <span className="text-sm text-slate-400">No skills added yet.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <CandidateActivityTimeline candidateId={previewCandidate.id} />
                    <CandidateNotesPanel candidateId={previewCandidate.id} />
                  </div>
                </div>

                <div className="border-t border-slate-800 p-6 md:border-t-0 md:border-l md:pt-8">
                  <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Profile actions</p>
                    <div className="mt-6 space-y-3">
                      <Link href={`/candidates/${previewCandidate.id}`} className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 text-center transition hover:bg-cyan-400">
                        Open full profile
                      </Link>
                      <Button variant="secondary" className="w-full rounded-3xl" onClick={() => setPreviewCandidate(null)}>
                        Close preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog.Root>
    </AppShell>
  );
}
