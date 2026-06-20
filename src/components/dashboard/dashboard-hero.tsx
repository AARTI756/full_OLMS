'use client';

import { motion } from 'framer-motion';
import { Briefcase, Crown, TrendingUp, Users } from 'lucide-react';
import { hoverGrow, panelFade } from '@/lib/motion';
import type { RecruiterPerformanceItem } from '@/types/dashboard';

interface DashboardHeroProps {
  totalOffers: number;
  pendingApprovals: number;
  acceptedOffers: number;
  activeCandidates: number;
  hiringMomentum?: string;
  acceptanceRate: number;
  topRecruiter?: RecruiterPerformanceItem;
  bestConversionRecruiter?: RecruiterPerformanceItem;
  spotlightMessage: string;
}

export function DashboardHero({
  totalOffers,
  pendingApprovals,
  acceptedOffers,
  activeCandidates,
  hiringMomentum,
  acceptanceRate,
  topRecruiter,
  bestConversionRecruiter,
  spotlightMessage,
}: DashboardHeroProps) {
  return (
    <motion.section initial="initial" animate="animate" variants={panelFade} className="hero-spotlight relative overflow-hidden rounded-[34px] border border-slate-800/80 bg-slate-950/95 shadow-[0_30px_90px_rgba(8,15,32,0.32)]">
      <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-4 h-24 w-24 rounded-full bg-slate-500/10 blur-3xl" />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr] p-6 sm:p-8">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-800/70 bg-slate-900/95 p-6 shadow-[0_24px_80px_rgba(11,18,38,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Executive command center</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">Hiring intelligence for the leadership team</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Actionable recruitment insight, recruiter momentum, and approval health in one premium workspace.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] bg-slate-950/90 p-5">
                <div className="flex items-center gap-2 text-cyan-300">
                  <TrendingUp className="h-4 w-4" />
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hiring momentum</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{hiringMomentum ?? '—'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Compared to last month, offer throughput is moving in the right direction.</p>
              </div>
              <div className="rounded-[28px] bg-slate-950/90 p-5">
                <div className="flex items-center gap-2 text-amber-300">
                  <Crown className="h-4 w-4" />
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Offer acceptance</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{acceptedOffers ? `${acceptanceRate}%` : '0%'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{totalOffers} offers span the active pipeline.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="rounded-[28px] border border-cyan-500/10 bg-slate-950/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active pipeline</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{activeCandidates}</p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/80 text-cyan-300">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">Candidates currently in play, ready for offers and approvals.</p>
            </motion.div>

            <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="rounded-[28px] border border-amber-500/10 bg-slate-950/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending approvals</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{pendingApprovals}</p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/80 text-amber-300">
                  <Briefcase className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">Approvals that are central to closing the next wave of offers.</p>
            </motion.div>
          </div>
        </div>

        <div className="grid gap-4">
          <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="rounded-[32px] border border-slate-800/70 bg-slate-950/90 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Top recruiter</p>
                <p className="mt-3 text-2xl font-semibold text-white">{topRecruiter?.recruiterName ?? 'N/A'}</p>
              </div>
              <div className="rounded-3xl bg-cyan-500/10 px-3 py-2 text-cyan-200">{topRecruiter ? `${topRecruiter.hireCount} hires` : 'No hires yet'}</div>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[24px] bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Recruiter velocity</p>
                <p className="mt-2 text-sm text-slate-400">{topRecruiter ? `${topRecruiter.offersCreated} offers, ${topRecruiter.candidateConversionRate}% conversion` : 'Awaiting recruiter activity.'}</p>
              </div>
              <div className="rounded-[24px] bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Leadership signal</p>
                <p className="mt-2 text-slate-400">{bestConversionRecruiter ? `${bestConversionRecruiter.recruiterName} is the current conversion leader.` : 'No conversion leader yet.'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="rounded-[32px] border border-slate-800/70 bg-gradient-to-br from-slate-950/95 via-slate-950 to-slate-900/90 p-6 shadow-[0_30px_80px_rgba(8,15,32,0.32)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-300">Executive insight</div>
            <h2 className="mt-4 text-xl font-semibold text-white">{spotlightMessage}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Monitor hiring health with context, avoid approval bottlenecks, and keep recruiter momentum aligned with business goals.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <div className="rounded-3xl bg-slate-900/80 px-3 py-2">Offer velocity</div>
              <div className="rounded-3xl bg-slate-900/80 px-3 py-2">Approval health</div>
              <div className="rounded-3xl bg-slate-900/80 px-3 py-2">Recruiter performance</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
