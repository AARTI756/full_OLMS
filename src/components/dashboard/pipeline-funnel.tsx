'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { hoverGrow } from '@/lib/motion';

interface PipelineFunnelProps {
  totalOffers: number;
  acceptedOffers: number;
  pendingApprovals: number;
  activeCandidates: number;
}

const items = [
  { label: 'Active candidates', key: 'activeCandidates', color: '#38bdf8' },
  { label: 'Offers issued', key: 'totalOffers', color: '#22c55e' },
  { label: 'Pending approvals', key: 'pendingApprovals', color: '#f59e0b' },
  { label: 'Offers accepted', key: 'acceptedOffers', color: '#14b8a6' },
];

export const PipelineFunnel = memo(function PipelineFunnel({ totalOffers, acceptedOffers, pendingApprovals, activeCandidates }: PipelineFunnelProps) {
  const values = { totalOffers, acceptedOffers, pendingApprovals, activeCandidates };
  const hasData = totalOffers + acceptedOffers + pendingApprovals + activeCandidates > 0;
  const maxValue = Math.max(totalOffers, acceptedOffers, pendingApprovals, activeCandidates, 1);
  const completionRate = totalOffers ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

  return (
    <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="glass-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hiring funnel</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Workflow throughput</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Live velocity</div>
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-800/70 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Offer completion</p>
            <p className="mt-2 text-3xl font-semibold text-white">{completionRate}%</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 px-3 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">Retention signal</div>
        </div>

        {hasData ? (
          <div className="mt-6 space-y-4">
            {items.map((item) => {
              const count = values[item.key as keyof typeof values] as number;
              const width = Math.max(8, Math.round((count / maxValue) * 100));

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-sm text-slate-400">{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{count}</p>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-800">
                    <div style={{ width: `${width}%`, backgroundColor: item.color }} className="h-full rounded-full transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-slate-800/80 bg-slate-900/80 p-6 text-center text-sm text-slate-400">
            No hiring funnel data available yet. Add candidates and offers to populate your executive workflow analytics.
          </div>
        )}
      </div>
    </motion.div>
  );
});
