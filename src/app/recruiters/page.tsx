'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shared/app-shell';
import { useRecruiterList } from '@/hooks/use-recruiters';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, Briefcase, CalendarDays, Crown, ShieldCheck, Trophy, TrendingUp, Users } from 'lucide-react';

export default function RecruitersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useRecruiterList();
  const recruiters = data?.data ?? [];

  const totals = recruiters.reduce(
    (acc, recruiter) => {
      acc.offers += recruiter.totalOffers;
      acc.active += recruiter.activeOffers;
      acc.pending += recruiter.pendingApprovals;
      acc.hires += recruiter.hireCount;
      acc.expiring += recruiter.expiringOffers;
      acc.stalled += recruiter.stalledCandidates;
      acc.acceptance += recruiter.acceptanceRate;
      acc.conversion += recruiter.conversionRate;
      return acc;
    },
    {
      offers: 0,
      active: 0,
      pending: 0,
      hires: 0,
      expiring: 0,
      stalled: 0,
      acceptance: 0,
      conversion: 0,
    }
  );

  const averageAcceptance = recruiters.length ? Math.round(totals.acceptance / recruiters.length) : 0;
  const averageConversion = recruiters.length ? Math.round(totals.conversion / recruiters.length) : 0;
  const topRecruiters = [...recruiters].sort((a, b) => b.hireCount - a.hireCount).slice(0, 5);
  const workload = [...recruiters].sort((a, b) => b.activeOffers - a.activeOffers).slice(0, 5);

  return (
    <AppShell>
      <section className="rounded-[32px] bg-slate-950/95 p-6 shadow-[0_30px_90px_rgba(8,15,32,0.35)] ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Recruiter intelligence</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Executive recruiter command center</h1>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Monitor recruiter health, hiring velocity, and ownership performance with premium analytics designed for executive decision making.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Button onClick={() => router.push('/recruiters/new')}>Invite recruiter</Button>
            <Button variant="secondary" onClick={() => router.refresh()}>Refresh team data</Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="glass-card p-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Total offers</span>
              <Briefcase className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{totals.offers}</p>
            <p className="mt-2 text-sm text-slate-500">Pipeline coverage across recruiters</p>
          </motion.div>
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="glass-card p-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Active offers</span>
              <CalendarDays className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{totals.active}</p>
            <p className="mt-2 text-sm text-slate-500">Current open offers managed</p>
          </motion.div>
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="glass-card p-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Accepted hires</span>
              <Trophy className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{totals.hires}</p>
            <p className="mt-2 text-sm text-slate-500">Closed offers driving hires</p>
          </motion.div>
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="glass-card p-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Average conversion</span>
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{averageConversion}%</p>
            <p className="mt-2 text-sm text-slate-500">Recruiter conversion across the network</p>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Hiring velocity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Recruiter leaderboard</h2>
            </div>
            <div className="rounded-full bg-slate-950/80 px-4 py-2 text-sm text-slate-300">Top performers by hiring impact</div>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-[28px] bg-slate-900/80" />
              ))
            ) : isError ? (
              <div className="rounded-[28px] border border-rose-500/10 bg-slate-900/80 p-8 text-center text-slate-400">Unable to load recruiter leaderboard. Try again later.</div>
            ) : !recruiters.length ? (
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-8 text-center text-slate-400">No recruiter data available. Add recruiters to view performance insights.</div>
            ) : (
              topRecruiters.map((recruiter, index) => (
                <motion.div key={recruiter.id} whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{index === 0 ? 'No. 1 performer' : `No. ${index + 1}`}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{recruiter.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{recruiter.department || 'Operations'}</p>
                    </div>
                    <div className="rounded-full bg-slate-950/80 px-3 py-2 text-sm text-slate-300">{recruiter.hireCount} hires</div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-950/90 p-3 text-xs uppercase tracking-[0.18em] text-slate-400">Offers {recruiter.totalOffers}</div>
                    <div className="rounded-3xl bg-slate-950/90 p-3 text-xs uppercase tracking-[0.18em] text-slate-400">Pending {recruiter.pendingApprovals}</div>
                    <div className="rounded-3xl bg-slate-950/90 p-3 text-xs uppercase tracking-[0.18em] text-slate-400">Conversion {recruiter.conversionRate}%</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Workload visualization</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Capacity bottlenecks</h3>
              </div>
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-[24px] bg-slate-900/80" />
                ))
              ) : recruiters.length ? (
                workload.map((recruiter) => {
                  const load = Math.min(100, Math.round((recruiter.activeOffers / Math.max(1, recruiter.totalOffers)) * 100));
                  return (
                    <div key={recruiter.id}>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>{recruiter.name}</span>
                        <span>{load}% load</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${load}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5 text-sm text-slate-400">No current workload insights available yet.</div>
              )}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Recruiter trend</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Team velocity</h3>
              </div>
              <BarChart3 className="h-6 w-6 text-cyan-300" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Avg candidate conversion</p>
                <p className="mt-3 text-3xl font-semibold text-white">{averageAcceptance}%</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Recruiter success rate</p>
                <p className="mt-3 text-3xl font-semibold text-white">{averageConversion}%</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-3xl border border-slate-800/90 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              <Crown className="h-4 w-4 text-amber-300" />
              <span>Focus on high-impact recruiters to accelerate pipeline velocity.</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Candidate ownership</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Ownership snapshot</h2>
            </div>
            <Users className="h-6 w-6 text-cyan-300" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Assigned candidates</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totals.offers}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Stalled candidates</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totals.stalled}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Expiring offers</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totals.expiring}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Approvals pending</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totals.pending}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Activity stream</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Recruiter pulse</h2>
            </div>
            <Activity className="h-6 w-6 text-cyan-300" />
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[24px] bg-slate-900/80" />
              ))
            ) : isError ? (
              <div className="rounded-[28px] border border-rose-500/10 bg-slate-900/80 p-6 text-center text-slate-400">Unable to load recruiter activity.</div>
            ) : !recruiters.length ? (
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-6 text-center text-slate-400">Activity will appear once recruiters start moving candidates.</div>
            ) : (
              recruiters.slice(0, 5).map((recruiter) => (
                <div key={recruiter.id} className="rounded-[24px] border border-slate-800/90 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                    <span>{recruiter.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 px-2 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">{recruiter.conversionRate}% conv</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{recruiter.pendingApprovals} approvals and {recruiter.activeOffers} active offers in flight.</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </section>
    </AppShell>
  );
}
