import { AppShell } from "@/components/shared/app-shell";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default function HomePage() {
  return (
    <AppShell>
      <section className="glass-card rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-6 shadow-[0_30px_90px_rgba(8,15,32,0.35)] ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/70">Executive workspace</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              HRMS & Offer Management Command Center
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Monitor candidate pipelines, move offers through approvals, and align recruiter performance with business outcomes in one premium executive dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/80 p-4 text-center shadow-inner shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Speed</p>
              <p className="mt-3 text-2xl font-semibold text-white">Lightning</p>
            </div>
            <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/80 p-4 text-center shadow-inner shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Visibility</p>
              <p className="mt-3 text-2xl font-semibold text-white">Real-time</p>
            </div>
            <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/80 p-4 text-center shadow-inner shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Trust</p>
              <p className="mt-3 text-2xl font-semibold text-white">Aligned</p>
            </div>
          </div>
        </div>
      </section>

      <DashboardOverview />
    </AppShell>
  );
}
