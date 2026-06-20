'use client';

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { offerCreateSchema } from "@/validators/offers";
import type { z } from "zod";
import type { CandidateListItem } from "@/types/candidate";
import type { OfferTemplateItem } from "@/types/template";
import type { OfferDetail } from "@/types/offer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type OfferUpdateInput = z.infer<typeof offerCreateSchema>;

type OfferEditFormProps = {
  offer: OfferDetail;
  candidates: CandidateListItem[];
  templates: OfferTemplateItem[];
};

const statuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "RELEASED", "ACCEPTED", "DECLINED"];
const departments = ["Engineering", "HR", "Sales", "Marketing", "Finance"];

export function OfferEditForm({ offer, candidates, templates }: OfferEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(offerCreateSchema),
    defaultValues: {
      candidateId: offer.candidateId,
      createdById: "",
      templateId: offer.templateId ?? "",
      title: offer.title,
      department: offer.departmentName,
      designation: offer.designation,
      status: offer.status as any,
      baseSalary: offer.baseSalary,
      variablePay: offer.variablePay,
      joiningBonus: offer.joiningBonus,
      retentionBonus: offer.retentionBonus,
      probationPeriodMonths: offer.probationPeriodMonths,
      offerDate: offer.offerDate.slice(0, 10),
      validUntil: offer.validUntil.slice(0, 10),
      approvalComments: offer.approvalComments ?? "",
    },
  });

  const [baseSalary, variablePay, joiningBonus, retentionBonus] = watch([
    "baseSalary",
    "variablePay",
    "joiningBonus",
    "retentionBonus",
  ]) as [number, number, number, number];

  const totalCtc = useMemo(
    () => baseSalary + variablePay + joiningBonus + retentionBonus,
    [baseSalary, variablePay, joiningBonus, retentionBonus]
  );

  async function onSubmit(values: OfferUpdateInput) {
    setError(null);

    try {
      await apiFetch(`/api/offers/${offer.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          templateId: values.templateId || null,
        }),
      });
      toast({
        title: "Offer updated",
        description: "Offer details were saved successfully.",
        variant: "success",
      });
      router.push(`/offers/${offer.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save offer.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Edit offer details</h1>
        <p className="text-sm text-slate-400">Update title, compensation, and approval status for this offer.</p>
      </div>

      {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Candidate</label>
          <Select {...register("candidateId")}>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>{candidate.fullName}</option>
            ))}
          </Select>
          {errors.candidateId ? <p className="mt-2 text-sm text-rose-300">{errors.candidateId.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Department</label>
          <Select {...register("department")}>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </Select>
          {errors.department ? <p className="mt-2 text-sm text-rose-300">{errors.department.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Offer title</label>
          <Input placeholder="Senior Backend Offer" {...register("title")} />
          {errors.title ? <p className="mt-2 text-sm text-rose-300">{errors.title.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Designation</label>
          <Input placeholder="Backend Engineer" {...register("designation")} />
          {errors.designation ? <p className="mt-2 text-sm text-rose-300">{errors.designation.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Status</label>
          <Select {...register("status")}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          {errors.status ? <p className="mt-2 text-sm text-rose-300">{errors.status.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Template</label>
          <Select {...register("templateId")}>
            <option value="">None</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>{template.title}</option>
            ))}
          </Select>
          {errors.templateId ? <p className="mt-2 text-sm text-rose-300">{errors.templateId.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Offer date</label>
          <Input type="date" {...register("offerDate")} />
          {errors.offerDate ? <p className="mt-2 text-sm text-rose-300">{errors.offerDate.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Valid until</label>
          <Input type="date" {...register("validUntil")} />
          {errors.validUntil ? <p className="mt-2 text-sm text-rose-300">{errors.validUntil.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Base salary</label>
          <Input type="number" step="0.01" {...register("baseSalary", { valueAsNumber: true })} />
          {errors.baseSalary ? <p className="mt-2 text-sm text-rose-300">{errors.baseSalary.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Variable pay</label>
          <Input type="number" step="0.01" {...register("variablePay", { valueAsNumber: true })} />
          {errors.variablePay ? <p className="mt-2 text-sm text-rose-300">{errors.variablePay.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Joining bonus</label>
          <Input type="number" step="0.01" {...register("joiningBonus", { valueAsNumber: true })} />
          {errors.joiningBonus ? <p className="mt-2 text-sm text-rose-300">{errors.joiningBonus.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Retention bonus</label>
          <Input type="number" step="0.01" {...register("retentionBonus", { valueAsNumber: true })} />
          {errors.retentionBonus ? <p className="mt-2 text-sm text-rose-300">{errors.retentionBonus.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Probation months</label>
          <Input type="number" min={0} {...register("probationPeriodMonths", { valueAsNumber: true })} />
          {errors.probationPeriodMonths ? <p className="mt-2 text-sm text-rose-300">{errors.probationPeriodMonths.message}</p> : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4 text-white">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Total CTC</span>
          <span className="text-lg font-semibold text-white">${totalCtc.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-400">Approval comments</label>
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
          rows={4}
          {...register("approvalComments")}
        />
        {errors.approvalComments ? <p className="mt-2 text-sm text-rose-300">{errors.approvalComments.message}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting}>
          {isSubmitting ? "Saving offer..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
