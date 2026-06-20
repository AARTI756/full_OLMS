import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { OfferEditForm } from "@/components/offers/offer-edit-form";
import { getCandidateList } from "@/services/candidate-service";
import { getOfferById } from "@/services/offer-service";
import { getTemplateList } from "@/services/template-service";

export default async function EditOfferPage({ params }: { params: { id: string } }) {
  const offer = await getOfferById(params.id);
  const candidates = await getCandidateList({ page: 1, limit: 50 });
  const templates = await getTemplateList({ page: 1, limit: 50 });

  if (!offer) {
    notFound();
  }

  return (
    <AppShell>
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Edit offer</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{offer.title}</h1>
          </div>
          <Link href={`/offers/${offer.id}`} className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-slate-800">
            Back to offer
          </Link>
        </div>
      </div>
      <OfferEditForm offer={offer} candidates={candidates.data} templates={templates.data} />
    </AppShell>
  );
}
