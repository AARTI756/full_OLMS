'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { DepartmentAnalyticsItem } from '@/types/dashboard';
import { hoverGrow } from '@/lib/motion';

interface DepartmentBarChartProps {
  departmentAnalytics: DepartmentAnalyticsItem[];
  onSelectDepartment?: (department: string) => void;
}

export const DepartmentBarChart = memo(function DepartmentBarChart({ departmentAnalytics, onSelectDepartment }: DepartmentBarChartProps) {
  const data = departmentAnalytics.length ? departmentAnalytics : [{ department: 'No data', offers: 0, accepted: 0, avgCtc: 0 }];
  const topDepartment = data.reduce((best, item) => (item.accepted > best.accepted ? item : best), data[0]);

  return (
    <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="glass-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Department analytics</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Hiring by team</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Top departments</div>
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-800/70 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Highest converting team</p>
            <p className="mt-2 text-lg font-semibold text-white">{topDepartment.department}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 px-3 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">Offer accepted</div>
        </div>
        <div className="mt-6 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 18, border: '1px solid rgba(56,189,248,0.16)' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar
                dataKey="offers"
                name="Offers"
                fill="#22d3ee"
                radius={[10, 10, 0, 0]}
                cursor={onSelectDepartment ? 'pointer' : 'default'}
                onClick={(data) => {
                  const department = (data as any)?.payload?.department;
                  if (department && onSelectDepartment) {
                    onSelectDepartment(department);
                  }
                }}
              />
              <Bar
                dataKey="accepted"
                name="Accepted"
                fill="#22c55e"
                radius={[10, 10, 0, 0]}
                cursor={onSelectDepartment ? 'pointer' : 'default'}
                onClick={(data) => {
                  const department = (data as any)?.payload?.department;
                  if (department && onSelectDepartment) {
                    onSelectDepartment(department);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
});
