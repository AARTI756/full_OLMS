'use client';

import { motion } from 'framer-motion';
import { Activity, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import type { DashboardActivityItem } from '@/types/dashboard';
import { panelFade, hoverGrow } from '@/lib/motion';

interface ActivityTimelineProps {
  items: DashboardActivityItem[];
  isLoading: boolean;
}

function activityIcon(action: string) {
  if (action.includes('APPROVAL')) return CheckCircle2;
  if (action.includes('TEMPLATE')) return FileText;
  return Activity;
}

function formatRelativeTime(createdAt: string) {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const seconds = Math.max(1, Math.floor((now - created) / 1000));

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityTimeline({ items, isLoading }: ActivityTimelineProps) {
  const grouped = items.reduce((acc, item) => {
    const label = new Date(item.createdAt).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {} as Record<string, DashboardActivityItem[]>);

  const groups = Object.entries(grouped);

  return (
    <motion.div initial="initial" animate="animate" variants={panelFade} className="glass-card rounded-[32px] border border-slate-800/80 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Live timeline</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Activity feed</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Realtime</div>
      </div>

      <div className="mt-6 space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[28px] border border-slate-800/80 bg-slate-950/80" />
          ))
        ) : groups.length ? (
          groups.map(([date, items]) => (
            <div key={date} className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{date}</p>
              <div className="space-y-3">
                {items.map((item) => {
                  const Icon = activityIcon(item.action);
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={hoverGrow.whileHover}
                      transition={{ duration: 0.22 }}
                      className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950/80 p-4 text-left shadow-[0_10px_40px_rgba(0,0,0,0.18)]"
                    >
                      <span className="absolute left-5 top-0 h-full w-0.5 bg-cyan-500/20" />
                      <div className="flex items-start gap-4">
                        <div className="mt-1 rounded-3xl bg-slate-900/80 p-3 text-cyan-300 shadow-inner shadow-slate-950/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
                        </div>
                        <div className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">{formatRelativeTime(item.createdAt)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/80 p-6 text-sm text-slate-400">
            No events have fired yet. Your hiring command center will fill with approvals, offers, and recruiter activity once work begins.
          </div>
        )}
      </div>
    </motion.div>
  );
}
