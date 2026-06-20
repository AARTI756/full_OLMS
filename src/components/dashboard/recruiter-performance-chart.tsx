'use client';

import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { RecruiterPerformanceItem } from '@/types/dashboard';

interface RecruiterPerformanceChartProps {
  recruiters: RecruiterPerformanceItem[];
  onSelectRecruiter?: (recruiter: string) => void;
}

export const RecruiterPerformanceChart = memo(function RecruiterPerformanceChart({ recruiters, onSelectRecruiter }: RecruiterPerformanceChartProps) {
  const data = recruiters.length
    ? recruiters.map((recruiter) => ({
        name: recruiter.recruiterName,
        offers: recruiter.offersCreated,
        hires: recruiter.hireCount,
      }))
    : [{ name: 'No data', offers: 0, hires: 0 }];

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recruiter impact</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Offer creation & hires</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Top team</div>
      </div>
      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 18, border: '1px solid rgba(56,189,248,0.16)' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }} />
            <Bar
              dataKey="offers"
              name="Offers"
              fill="#3b82f6"
              radius={[10, 10, 0, 0]}
              cursor={onSelectRecruiter ? 'pointer' : 'default'}
              onClick={(data) => {
                const name = (data as any)?.payload?.name;
                if (name && onSelectRecruiter) {
                  onSelectRecruiter(name);
                }
              }}
            />
            <Bar
              dataKey="hires"
              name="Hires"
              fill="#22c55e"
              radius={[10, 10, 0, 0]}
              cursor={onSelectRecruiter ? 'pointer' : 'default'}
              onClick={(data) => {
                const name = (data as any)?.payload?.name;
                if (name && onSelectRecruiter) {
                  onSelectRecruiter(name);
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
