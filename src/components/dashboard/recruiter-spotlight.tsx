'use client';

import { motion } from 'framer-motion';
import { Crown, TrendingUp, Users } from 'lucide-react';
import type { RecruiterPerformanceItem } from '@/types/dashboard';
import { hoverGrow, panelFade } from '@/lib/motion';

interface RecruiterSpotlightProps {
  topRecruiter?: RecruiterPerformanceItem;
  bestConversionRecruiter?: RecruiterPerformanceItem;
}

export function RecruiterSpotlight({ topRecruiter, bestConversionRecruiter }: RecruiterSpotlightProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={panelFade}
      className="glass-card rounded-[32px] border border-slate-800/80 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recruiter intelligence</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Spotlight</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Team impact</div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <motion.div
          whileHover={hoverGrow.whileHover}
          transition={hoverGrow.transition}
          className="rounded-[28px] border border-cyan-500/10 bg-slate-950/80 p-5"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
            <Crown className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-slate-500">Top recruiter</p>
          <p className="mt-2 text-lg font-semibold text-white">{topRecruiter?.recruiterName ?? 'No recruiter yet'}</p>
          <p className="mt-3 text-sm text-slate-400">
            {topRecruiter?.recruiterName
              ? `Best throughput with ${topRecruiter.offersCreated} offers and ${topRecruiter.hireCount} hires.`
              : 'No recruiter activity yet. Invite the first hiring partner to activate scorecards.'}
          </p>
        </motion.div>

        <motion.div
          whileHover={hoverGrow.whileHover}
          transition={hoverGrow.transition}
          className="rounded-[28px] border border-emerald-500/10 bg-slate-950/80 p-5"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-slate-500">Highest conversion</p>
          <p className="mt-2 text-lg font-semibold text-white">{bestConversionRecruiter?.recruiterName ?? 'No conversion yet'}</p>
          <p className="mt-3 text-sm text-slate-400">
            {bestConversionRecruiter
              ? `${bestConversionRecruiter.candidateConversionRate}% conversion`
              : 'Conversion metrics will appear once offers and candidates move through the funnel.'}
          </p>
        </motion.div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan-300" />
          <p>Recruiter scorecards refresh with every candidate move and approval event.</p>
        </div>
      </div>
    </motion.div>
  );
}
