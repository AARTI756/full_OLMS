'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/shared/app-shell';
import { useRecruiterDetail } from '@/hooks/use-recruiters';
import { Button } from '@/components/ui/button';
import { Activity, ArrowUpRight, BarChart3, CalendarDays, CheckCircle2, Crown, FileText, ShieldCheck, Trophy, Users } from 'lucide-react';

export default function RecruiterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { data, isLoading, isError } = useRecruiterDetail(id);

  const recruiter = data?.data;
  const totalCandidates = recruiter?.ownedCandidates.length ?? 0;
  const totalOffers = recruiter?.ownedOffers.length ?? 0;
  const acceptanceTrend = recruiter ? (recruiter.acceptanceRate >= 75 ? 'improving' : recruiter.acceptanceRate >= 50 ? 'stable' : 'needs attention') : 'stable';
  const trendColor = acceptanceTrend === 'improving' ? 'text-emerald-300' : acceptanceTrend === 'stable' ? 'text-cyan-300' : 'text-amber-300';

  return (
    <AppShell>
      <div className="mb-6 grid gap-6 xl:grid-cols-[0.68fr_0.32fr]">
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-[0_30px_90px_rgba(8,15,32,0.3)] ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Recruiter profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{recruiter?.name ?? 'Recruiter intelligence'}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Executive summary for recruiter performance, ownership, and team throughput.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => router.push('/recruiters')}>Back to recruiters</Button>
              <Button onClick={() => router.refresh()}>Refresh</Button>
            </div>
          </div>

          {recruiter && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pipeline grip</p>
                <p className="mt-3 text-3xl font-semibold text-white">{recruiter.totalOffers}</p>
                <p className="mt-2 text-sm text-slate-500">Offers created</p>
              </div>
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Hiring momentum</p>
                <p className="mt-3 text-3xl font-semibold text-white">{recruiter.hireCount}</p>
                <p className="mt-2 text-sm text-slate-500">Accepted hires</p>
              </div>
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Conversion health</p>
                <div className="mt-3 flex items-center gap-2 text-3xl font-semibold text-white">
                  {recruiter.conversionRate}%
                  <ArrowUpRight className={`h-5 w-5 ${trendColor}`} />
                </div>
                <p className="mt-2 text-sm text-slate-500">Candidate to hire efficiency</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-[0_30px_90px_rgba(8,15,32,0.3)] ring-1 ring-slate-800/60">
          {recruiter ? (
            <div className="space-y-5">
              <div className="rounded-[28px] bg-slate-900/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Recruiter KPI</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/90 p-4">
                    <p className="text-sm text-slate-400">Pending approvals</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{recruiter.pendingApprovals}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/90 p-4">
                    <p className="text-sm text-slate-400">Expiring offers</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{recruiter.expiringOffers}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/90 p-4">
                    <p className="text-sm text-slate-400">Stalled candidates</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{recruiter.stalledCandidates}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/90 p-4">
                    <p className="text-sm text-slate-400">Approval success</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{recruiter.approvalSuccessRate}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-slate-900/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Role ownership</p>
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between rounded-3xl bg-slate-950/90 p-4">
                    <span className="text-sm text-slate-300">Candidates owned</span>
                    <span className="font-semibold text-white">{totalCandidates}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-3xl bg-slate-950/90 p-4">
                    <span className="text-sm text-slate-300">Offers owned</span>
                    <span className="font-semibold text-white">{totalOffers}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>

      {isLoading ? (
        <div className="rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded-2xl bg-slate-900/80" />
            <div className="h-6 rounded-2xl bg-slate-900/80" />
            <div className="h-56 rounded-[32px] bg-slate-900/80" />
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60 text-center text-slate-400">
          Unable to load recruiter details.
        </div>
      ) : !recruiter ? (
        <div className="rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60 text-center text-slate-400">
          Recruiter not found.
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Recruiter analytics</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Hiring velocity</h2>
                </div>
                <CalendarDays className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Conversion</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{recruiter.conversionRate}%</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Acceptance</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{recruiter.acceptanceRate}%</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Approval speed</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{recruiter.avgTurnaroundDays}d</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Performance trend</span>
                  <span className={`font-semibold ${trendColor}`}>{acceptanceTrend}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${recruiter.acceptanceRate}%` }} />
                </div>
                <p className="text-sm text-slate-400">Focus on improving offer cadence and candidate conversion for this recruiter.</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Candidate ownership</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Ownership heatmap</h2>
                </div>
                <Users className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Controlled candidates</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalCandidates}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Offer documents</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalOffers}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Reporting</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{recruiter.pendingApprovals} approvals</p>
                </div>
              </div>
              <div className="mt-6 rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5 text-sm leading-6 text-slate-400">
                <p className="font-semibold text-white">Executive note</p>
                <p className="mt-2">Use this view to align recruiter activity with pipeline health and cross-team delivery timelines.</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-6 rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Owned candidates</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Candidate pipeline</h2>
              </div>
              <Link href="/candidates" className="text-sm text-cyan-300 transition hover:text-cyan-200">View all candidates</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-200">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {recruiter.ownedCandidates.length ? (
                    recruiter.ownedCandidates.map((candidate) => (
                      <tr key={candidate.id} className="rounded-[22px] bg-slate-900/70">
                        <td className="px-4 py-4 font-semibold text-white">{candidate.fullName}</td>
                        <td className="px-4 py-4">{candidate.status}</td>
                        <td className="px-4 py-4">{candidate.role}</td>
                        <td className="px-4 py-4">{candidate.department}</td>
                        <td className="px-4 py-4">{candidate.location}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No candidates assigned to this recruiter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Owned offers</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Offer activity</h2>
              </div>
              <Link href="/offers" className="text-sm text-cyan-300 transition hover:text-cyan-200">View all offers</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-200">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">CTC</th>
                    <th className="px-4 py-3">Valid until</th>
                  </tr>
                </thead>
                <tbody>
                  {recruiter.ownedOffers.length ? (
                    recruiter.ownedOffers.map((offer) => (
                      <tr key={offer.id} className="rounded-[22px] bg-slate-900/70">
                        <td className="px-4 py-4 font-semibold text-white">{offer.title}</td>
                        <td className="px-4 py-4">{offer.candidateName}</td>
                        <td className="px-4 py-4">{offer.status}</td>
                        <td className="px-4 py-4">${offer.totalCtc.toLocaleString()}</td>
                        <td className="px-4 py-4">{new Date(offer.validUntil).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No offers found for this recruiter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
