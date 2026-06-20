import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateDetailTabs } from "@/components/candidates/candidate-detail-tabs";
import { getCandidateById } from "@/services/candidate-service";
import { formatCurrency } from "@/lib/utils";

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
const statusMeta: Record<string, { variant: BadgeVariant; label: string; progress: number }> = {
  NEW: { variant: 'default', label: 'New lead', progress: 10 },
  SCREENING: { variant: 'warning', label: 'Screening', progress: 35 },
  INTERVIEW: { variant: 'info', label: 'Interviewing', progress: 60 },
  OFFERED: { variant: 'info', label: 'Offered', progress: 80 },
  HIRED: { variant: 'success', label: 'Hired', progress: 100 },
  REJECTED: { variant: 'danger', label: 'Rejected', progress: 20 },
};

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await getCandidateById(params.id);

  if (!candidate) {
    notFound();
  }

  const stage = statusMeta[candidate.status] ?? { variant: 'default', label: candidate.status, progress: 30 };

  return (
    <AppShell>
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Candidate profile</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">{candidate.fullName}</h1>
                <p className="mt-2 text-sm text-slate-400">{candidate.role} • {candidate.department}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/candidates" className="inline-flex rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-slate-800">
                  Back to candidates
                </Link>
                <Link href={`/candidates/${candidate.id}/edit`} className="inline-flex rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Edit profile
                </Link>
                <Badge variant={stage.variant}>{candidate.status}</Badge>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Talent overview</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">Executive candidate snapshot</h2>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Recruiter</p>
                      <p className="mt-2 text-lg font-semibold text-white">{candidate.recruiterName || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Resume</p>
                      <p className="mt-2 text-lg font-semibold text-white">{candidate.resumeUrl ? 'Uploaded' : 'No resume'}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                      <p>Pipeline readiness</p>
                      <p>{stage.label}</p>
                    </div>
                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${stage.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Key metrics</p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl bg-slate-950/90 p-4">
                      <p className="text-sm text-slate-400">Current CTC</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(candidate.currentCtc)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/90 p-4">
                      <p className="text-sm text-slate-400">Expected CTC</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(candidate.expectedCtc)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/90 p-4">
                      <p className="text-sm text-slate-400">Experience</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{candidate.experienceYears} yrs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6 shadow-inner">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Opportunity health</p>
              <div className="mt-6 grid gap-4">
                <div className="flex items-center justify-between rounded-3xl bg-slate-950/90 px-4 py-4">
                  <p className="text-sm text-slate-400">Notice period</p>
                  <p className="font-semibold text-white">{candidate.noticePeriodDays} days</p>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-950/90 px-4 py-4">
                  <p className="text-sm text-slate-400">Resume latest</p>
                  <p className="font-semibold text-white">{candidate.resumeUrl ? 'Saved' : 'Pending'}</p>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-950/90 px-4 py-4">
                  <p className="text-sm text-slate-400">Offer history</p>
                  <p className="font-semibold text-white">{candidate.offerHistory.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6 shadow-inner">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Next action</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Take a recruiting move</h2>
                </div>
                <Button variant="primary" className="rounded-3xl">Create offer</Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">Use the candidate timeline and offer history to decide whether to push forward with interview scheduling or approval preparation.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">Personal details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Email", value: candidate.email },
                  { label: "Phone", value: candidate.phone },
                  { label: "Location", value: candidate.location },
                  { label: "Recruiter", value: candidate.recruiterName ?? "Unassigned" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-base font-medium text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Compensation details</h2>
                  <p className="mt-1 text-sm text-slate-400">Expected versus current offer summary.</p>
                </div>
                <span className="text-sm text-slate-500">CTC focus</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Current CTC", value: formatCurrency(candidate.currentCtc) },
                  { label: "Expected CTC", value: formatCurrency(candidate.expectedCtc) },
                  { label: "Experience", value: `${candidate.experienceYears} years` },
                  { label: "Notice period", value: `${candidate.noticePeriodDays} days` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">Offer history</h2>
              <div className="mt-6 space-y-4">
                {candidate.offerHistory.length ? (
                  candidate.offerHistory.map((offer) => (
                    <Link key={offer.id} href={`/offers/${offer.id}`} className="block rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">{offer.title}</p>
                          <p className="mt-1 text-base font-semibold text-white">v{offer.version}</p>
                        </div>
                        <span className="text-sm text-slate-400">{new Date(offer.offerDate).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">{offer.status}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No offers found yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <CandidateDetailTabs candidate={candidate} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
