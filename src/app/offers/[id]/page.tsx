import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OfferApprovalActions } from "@/components/offers/offer-approval-actions";
import { OfferRequestApproval } from "@/components/offers/offer-request-approval";
import { TemplatePreview } from "@/components/templates/template-preview";
import { getOfferById } from "@/services/offer-service";
import type { OfferApprovalSummary } from "@/types/offer";
import { formatCurrency, formatPercentage } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  DRAFT: "bg-slate-900 text-slate-200",
  PENDING: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
  RELEASED: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  ACCEPTED: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  DECLINED: "bg-slate-700 text-slate-100",
};

function getExpiryCountdown(validUntil: string) {
  const expires = new Date(validUntil).getTime();
  const now = Date.now();
  const diff = Math.max(0, expires - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

export default async function OfferDetailPage({ params }: { params: { id: string } }) {
  const offer = await getOfferById(params.id);

  if (!offer) {
    notFound();
  }

  const compensationRows = [
    { label: "Base salary", value: formatCurrency(offer.baseSalary) },
    { label: "Variable pay", value: formatCurrency(offer.variablePay) },
    { label: "Joining bonus", value: formatCurrency(offer.joiningBonus) },
    { label: "Retention bonus", value: formatCurrency(offer.retentionBonus) },
    { label: "Total CTC", value: formatCurrency(offer.totalCtc) },
  ];

  const offerStage =
    offer.status === 'DRAFT' ? 15 :
    offer.status === 'PENDING' ? 45 :
    offer.status === 'APPROVED' ? 70 :
    offer.status === 'RELEASED' ? 85 :
    offer.status === 'ACCEPTED' ? 100 : 20;

  const stageLabel =
    offer.status === 'DRAFT' ? 'Drafting' :
    offer.status === 'PENDING' ? 'Awaiting approval' :
    offer.status === 'APPROVED' ? 'Approved' :
    offer.status === 'RELEASED' ? 'Released' :
    offer.status === 'ACCEPTED' ? 'Accepted' :
    offer.status;

  const expiryCountdown = getExpiryCountdown(offer.validUntil);

  return (
    <AppShell>
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Offer details</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{offer.title}</h1>
            <p className="mt-2 text-sm text-slate-400">{offer.designation} • {offer.departmentName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/offers" className="inline-flex rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-slate-800">
              Back to offers
            </Link>
            <Link href={`/offers/${offer.id}/edit`} className="inline-flex rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Edit offer
            </Link>
            <Badge
              variant={
                offer.status === "APPROVED"
                  ? "success"
                  : offer.status === "REJECTED"
                  ? "danger"
                  : offer.status === "PENDING"
                  ? "warning"
                  : "default"
              }
            >
              {offer.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Candidate", value: offer.candidateName, href: `/candidates/${offer.candidateId}` },
                { label: "Email", value: offer.candidateEmail },
                { label: "Phone", value: offer.candidatePhone },
                { label: "Valid until", value: new Date(offer.validUntil).toLocaleDateString() },
                { label: "Offer date", value: new Date(offer.offerDate).toLocaleDateString() },
                { label: "Version", value: `v${offer.version}` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  {item.href ? (
                    <Link href={item.href} className="mt-2 block text-base font-medium text-cyan-300 hover:text-cyan-200">
                      {item.value}
                    </Link>
                  ) : (
                    <p className="mt-2 text-base font-medium text-white">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Offer lifecycle</h2>
                <p className="text-sm text-slate-400">Track approval progress and expiry status.</p>
              </div>
              <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-sm text-slate-300">{stageLabel}</span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Expiry countdown</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{expiryCountdown}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/90 px-3 py-2 text-sm text-cyan-300">Expires {new Date(offer.validUntil).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                  <span>Workflow completion</span>
                  <span>{offerStage}% complete</span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${offerStage}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Compensation breakdown</h2>
            <div className="mt-6 space-y-4">
              {compensationRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-800/90 bg-slate-900/80 px-4 py-4">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className="font-semibold text-white">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span>Variable pay ratio</span>
                <span>{formatPercentage((offer.variablePay / Math.max(1, offer.totalCtc)) * 100)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Approval history</h2>
              <Button variant="ghost" className="rounded-3xl px-4 py-2 text-slate-300 hover:bg-slate-800/80">Add note</Button>
            </div>
            <div className="mt-6 space-y-4">
              {offer.approvals.length ? (
                offer.approvals.map((approval: OfferApprovalSummary) => (
                  <div key={approval.id} className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{approval.approverName}</p>
                        <p className="mt-1 text-base font-semibold text-white">{approval.decision}</p>
                      </div>
                      <span className="text-sm text-slate-500">{approval.decidedAt ? new Date(approval.decidedAt).toLocaleDateString() : "Pending"}</span>
                    </div>
                    {approval.comments && <p className="mt-3 text-sm text-slate-300">{approval.comments}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No approval activity yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {offer.status === "DRAFT" ? (
            <OfferRequestApproval offerId={offer.id} />
          ) : offer.status === "PENDING" ? (
            <OfferApprovalActions offerId={offer.id} />
          ) : null}

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Offer template</h2>
            <p className="mt-4 text-sm text-slate-300">{offer.templateTitle ?? "No template selected."}</p>
            {offer.templateId ? (
              <div className="mt-6">
                <TemplatePreview
                  title={offer.templateTitle ?? 'Offer template preview'}
                  content=""
                  templateId={offer.templateId}
                  offerId={offer.id}
                />
              </div>
            ) : null}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Comments</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{offer.approvalComments ?? "No comments have been added to this offer yet."}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
