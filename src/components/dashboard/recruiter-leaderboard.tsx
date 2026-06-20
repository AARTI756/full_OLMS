'use client';

import type { RecruiterPerformanceItem } from '@/types/dashboard';

interface RecruiterLeaderboardProps {
  recruiters: RecruiterPerformanceItem[];
  onSelectRecruiter?: (recruiter: string) => void;
}

export function RecruiterLeaderboard({ recruiters, onSelectRecruiter }: RecruiterLeaderboardProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recruiter leaderboard</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Top performers</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-slate-300">Drive hiring velocity</div>
      </div>
      <div className="mt-6 space-y-4">
        {recruiters.length ? (
          recruiters.map((recruiter, index) => (
            <button
              key={recruiter.recruiterName}
              type="button"
              onClick={() => onSelectRecruiter?.(recruiter.recruiterName)}
              className="w-full rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4 text-left transition hover:border-cyan-300/50 hover:bg-slate-900/90"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">#{index + 1} {recruiter.recruiterName}</p>
                  <p className="mt-1 text-base font-semibold text-white">{recruiter.offersCreated} offers created</p>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">{recruiter.approvalSuccessRate}% approval</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/80 p-3 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.24em]">Conversion</p>
                  <p className="mt-2 text-lg font-semibold text-white">{recruiter.candidateConversionRate}%</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-3 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.24em]">Acceptance</p>
                  <p className="mt-2 text-lg font-semibold text-white">{recruiter.acceptanceRate}%</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-3 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.24em]">Avg turnaround</p>
                  <p className="mt-2 text-lg font-semibold text-white">{recruiter.avgTurnaroundDays} days</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-3 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.24em]">Hires</p>
                  <p className="mt-2 text-lg font-semibold text-white">{recruiter.hireCount}</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-400">
            No recruiter activity yet. Hire team members, assign candidates, and start the performance dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
