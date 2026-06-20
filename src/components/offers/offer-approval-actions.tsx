'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type OfferApprovalActionsProps = {
  offerId: string;
};

export function OfferApprovalActions({ offerId }: OfferApprovalActionsProps) {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleApproval() {
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/api/offers/${offerId}/approvals`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          comments: comments || null,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit approval.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Approval action</h2>
            <p className="text-sm text-slate-400">Submit a decision for this offer.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={decision === "APPROVED" ? "primary" : "outline"}
              onClick={() => setDecision("APPROVED")}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              className={decision === "REJECTED" ? "border-rose-500 text-rose-300 hover:bg-rose-500/10" : ""}
              onClick={() => setDecision("REJECTED")}
            >
              Reject
            </Button>
          </div>
        </div>

        <textarea
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Add a comment for the approval record (optional)"
          className="min-h-[140px] w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button type="button" onClick={handleApproval} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : `Submit ${decision.toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}
