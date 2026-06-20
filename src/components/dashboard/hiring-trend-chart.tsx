'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';
import type { DashboardMonthlyHiringItem } from '@/types/dashboard';
import { hoverGrow } from '@/lib/motion';

const fallbackData = [
  { month: 'Jan', hires: 0 },
  { month: 'Feb', hires: 0 },
  { month: 'Mar', hires: 0 },
  { month: 'Apr', hires: 0 },
  { month: 'May', hires: 0 },
  { month: 'Jun', hires: 0 },
];

interface HiringTrendChartProps {
  monthlyHiring: DashboardMonthlyHiringItem[];
}

export const HiringTrendChart = memo(function HiringTrendChart({ monthlyHiring }: HiringTrendChartProps) {
  const data = monthlyHiring.length ? monthlyHiring : fallbackData;
  const latest = data[data.length - 1]?.hires ?? 0;
  const previous = data[data.length - 2]?.hires ?? 0;
  const momentum = previous ? Math.round(((latest - previous) / previous) * 100) : 0;

  return (
    <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="glass-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hiring trend</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Monthly hires</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Last 6 months</div>
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-800/70 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Current cycle momentum</p>
            <p className="mt-2 text-3xl font-semibold text-white">{momentum >= 0 ? `+${momentum}%` : `${momentum}%`}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 px-3 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">Premium signal</div>
        </div>
        <div className="mt-6 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="hiringGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 18, border: '1px solid rgba(56,189,248,0.16)' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="hires" stroke="none" fill="url(#hiringGradient)" />
              <Line
                type="monotone"
                dataKey="hires"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#22c55e', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
});
