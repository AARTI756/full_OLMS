import { AppShell } from "@/components/shared/app-shell";
import { OfferCreateForm } from "@/components/offers/offer-create-form";
import { getCandidateList } from "@/services/candidate-service";
import { getTemplateList } from "@/services/template-service";

export default async function NewOfferPage() {
  const candidates = await getCandidateList({ page: 1, limit: 50 });
  const templates = await getTemplateList({ page: 1, limit: 50 });

  return (
    <AppShell>
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Create offer</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">New offer document</h1>
          </div>
        </div>
      </div>
      <OfferCreateForm candidates={candidates.data} templates={templates.data} />
    </AppShell>
  );
}
