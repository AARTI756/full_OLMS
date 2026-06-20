import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { CandidateCreateForm } from "@/components/candidates/candidate-create-form";

export default function NewCandidatePage() {
  return (
    <AppShell>
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Create candidate</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">New candidate profile</h1>
          </div>
          <Link href="/candidates" className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-slate-800">
            Back to candidates
          </Link>
        </div>
      </div>
      <CandidateCreateForm />
    </AppShell>
  );
}
