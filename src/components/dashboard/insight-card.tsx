'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Lightbulb, Sparkles } from 'lucide-react';
import { hoverGrow, panelFade } from '@/lib/motion';

interface InsightCardProps {
  title: string;
  metric: string;
  summary: string;
  badge: string;
  accent?: 'cyan' | 'emerald' | 'amber';
}

const accentClasses: Record<NonNullable<InsightCardProps['accent']>, string> = {
  cyan: 'text-cyan-300 bg-cyan-500/10',
  emerald: 'text-emerald-300 bg-emerald-500/10',
  amber: 'text-amber-300 bg-amber-500/10',
};

export function InsightCard({ title, metric, summary, badge, accent = 'cyan' }: InsightCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={panelFade}
      whileHover={hoverGrow.whileHover}
      transition={hoverGrow.transition}
      className="glass-card overflow-hidden rounded-[32px] border border-slate-800/80 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{metric}</p>
        </div>
        <div className={`inline-flex h-12 min-w-[3rem] items-center justify-center rounded-3xl ${accentClasses[accent]} text-sm font-semibold`}> {badge} </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">{summary}</p>
      <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        <span>Executive insight</span>
      </div>
    </motion.div>
  );
}
