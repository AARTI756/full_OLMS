'use client';

import { ArrowUpRight, Clock3, FileText, MessageCircle, Sparkles } from 'lucide-react';
import { useCandidateActivities } from '@/hooks/use-candidate-activities';

interface CandidateActivityTimelineProps {
  candidateId: string;
}

function getActivityIcon(action: string) {
  const name = action.toLowerCase();

  if (name.includes('resume') || name.includes('upload')) {
    return FileText;
  }
  if (name.includes('note') || name.includes('comment')) {
    return MessageCircle;
  }
  if (name.includes('status') || name.includes('offer')) {
    return ArrowUpRight;
  }
  return Sparkles;
}

export function CandidateActivityTimeline({ candidateId }: CandidateActivityTimelineProps) {
  const { data, isLoading, isError } = useCandidateActivities(candidateId);
  const activities = data?.data ?? [];

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Activity logs</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Candidate timeline</h2>
        </div>
        <p className="text-sm text-slate-400">Review updates, resume uploads, status moves, and recruiter notes in one place.</p>
      </div>

      <div className="relative mt-8">
        <div className="pointer-events-none absolute left-5 top-0 h-full w-px bg-slate-800/70" />
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-950/80" />
            ))
          ) : isError ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">Unable to load activity logs.</div>
          ) : activities.length ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.action);
              return (
                <div key={activity.id} className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-5 pl-14">
                  <span className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-cyan-300 shadow-lg shadow-cyan-500/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div>
                      <p className="text-sm font-semibold text-white">{activity.action.replace(/_/g, ' ')}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{activity.details}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{new Date(activity.createdAt).toLocaleString()} · {activity.userName}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">No activity has been recorded yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
