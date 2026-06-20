'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type OfferRequestApprovalProps = {
  offerId: string;
};

export function OfferRequestApproval({ offerId }: OfferRequestApprovalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRequestApproval() {
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/api/offers/${offerId}/approvals`, {
        method: "POST",
        body: JSON.stringify({
          decision: "PENDING",
          comments: null,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request approval.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Request approval</h2>
          <p className="mt-2 text-sm text-slate-400">Send this offer for review before finalizing the next step.</p>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button type="button" onClick={handleRequestApproval} disabled={isSubmitting}>
          {isSubmitting ? "Requesting..." : "Request approval"}
        </Button>
      </div>
    </div>
  );
}
