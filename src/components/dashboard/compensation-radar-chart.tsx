'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import type { CompensationAnalytics } from '@/types/dashboard';
import { hoverGrow } from '@/lib/motion';

interface CompensationRadarChartProps {
  compensationAnalytics: CompensationAnalytics;
}

export const CompensationRadarChart = memo(function CompensationRadarChart({ compensationAnalytics }: CompensationRadarChartProps) {
  const data = useMemo(
    () => [
      { name: 'Avg CTC', value: Math.round(compensationAnalytics.avgCtc / 1000) },
      { name: 'Highest', value: Math.round(compensationAnalytics.highestCtc / 1000) },
      { name: 'Lowest', value: Math.round(compensationAnalytics.lowestCtc / 1000) },
      { name: 'Budget', value: Math.round(compensationAnalytics.totalBudget / 10000) },
    ],
    [compensationAnalytics]
  );

  return (
    <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="glass-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Compensation</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Distribution spotlight</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Salary intensity</div>
      </div>
      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="rgba(148,163,184,0.12)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
            <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 18, border: '1px solid rgba(56,189,248,0.16)' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});
