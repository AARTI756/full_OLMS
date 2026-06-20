"use client";

import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { hoverGrow } from '@/lib/motion';

const fallbackData = [
  { name: 'APPROVED', value: 42 },
  { name: 'PENDING', value: 25 },
  { name: 'REJECTED', value: 8 },
  { name: 'ACCEPTED', value: 15 },
  { name: 'RELEASED', value: 6 },
  { name: 'DRAFT', value: 12 },
  { name: 'DECLINED', value: 3 },
];

const colors = ['#22d3ee', '#38bdf8', '#f59e0b', '#22c55e', '#06b6d4', '#94a3b8', '#fb7185'];

type StatusChartProps = {
  statusDistribution: { name: string; value: number }[];
  onSelectStatus?: (status: string) => void;
};

export function StatusChart({ statusDistribution, onSelectStatus }: StatusChartProps) {
  const data = statusDistribution.length ? statusDistribution : fallbackData;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div whileHover={hoverGrow.whileHover} transition={hoverGrow.transition} className="glass-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Offer status</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Distribution</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Last 30 days</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={68}
                outerRadius={104}
                paddingAngle={4}
                cornerRadius={14}
                stroke="none"
                cursor={onSelectStatus ? 'pointer' : 'default'}
                onClick={(entry) => {
                  if (onSelectStatus && entry && typeof entry.name === 'string') {
                    onSelectStatus(entry.name);
                  }
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0b1127', borderRadius: 18, border: '1px solid rgba(56, 189, 248, 0.16)' }} labelStyle={{ color: '#ffffff' }} itemStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 rounded-[28px] border border-slate-800/90 bg-slate-950/80 p-4 text-sm text-slate-300">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status summary</p>
          <p className="text-3xl font-semibold text-white">{total.toLocaleString()}</p>
          <p className="leading-6 text-slate-400">A clear view of offer flow across approval, acceptance, and draft stages.</p>
          <div className="space-y-2">
            {data.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between gap-3">
                <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="truncate text-sm text-slate-300">{entry.name}</span>
                <span className="text-sm font-semibold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
