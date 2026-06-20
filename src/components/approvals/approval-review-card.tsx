'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ApprovalReviewCardProps = {
  item: {
    id: string;
    offerId: string;
    offerTitle: string;
    stage: string;
    status: string;
    approverId: string;
    approverName: string;
    due: string;
    decidedAt?: string | null;
  };
};

const statusColor = {
  PENDING: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
};

export function ApprovalReviewCard({ item }: ApprovalReviewCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDecision(decision: "APPROVED" | "REJECTED") {
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/api/offers/${item.offerId}/approvals`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          comments: comments || null,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit decision.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-slate-800/90 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">{item.offerTitle}</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">{item.stage}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusColor[item.status as keyof typeof statusColor]}`}>{item.status}</span>
          </div>
          <p className="text-sm text-slate-400">Assigned to {item.approverName}</p>
        </div>

        <div className="space-y-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-right text-sm text-slate-300">
          <p>Due {new Date(item.due).toLocaleDateString()}</p>
          {item.decidedAt ? <p>Decided {new Date(item.decidedAt).toLocaleDateString()}</p> : <p className="text-amber-300">Decision pending</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Request", active: true },
          { label: "Review", active: item.status !== "PENDING" },
          { label: "Decision", active: item.status === "APPROVED" || item.status === "REJECTED" },
        ].map((step) => (
          <div key={step.label} className={`rounded-3xl border p-3 text-center text-xs uppercase tracking-[0.18em] ${step.active ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100" : "border-slate-800 bg-slate-900 text-slate-500"}`}>
            {step.label}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-5">
        <p className="text-sm font-medium text-slate-300">Review note</p>
        <textarea
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Add a comment for the decision record"
          className="mt-3 min-h-[130px] w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" variant="primary" onClick={() => handleDecision("APPROVED")} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Approve"}
        </Button>
        <Button type="button" variant="outline" className="border-rose-500 text-rose-300 hover:bg-rose-500/10" onClick={() => handleDecision("REJECTED")} disabled={isSubmitting}>
          Reject
        </Button>
        <Link href={`/offers/${item.offerId}`} className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-slate-800">
          Open offer
        </Link>
      </div>
    </div>
  );
}
