'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { candidateCreateSchema } from "@/validators/candidates";
import type { z } from "zod";
import type { CandidateDetail } from "@/types/candidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type CandidateUpdateInput = z.infer<typeof candidateCreateSchema>;

type CandidateEditFormProps = {
  candidate: CandidateDetail;
};

const statuses = ["NEW", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"];
const departments = ["Engineering", "HR", "Sales", "Marketing", "Finance"];

export function CandidateEditForm({ candidate }: CandidateEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(candidateCreateSchema),
    defaultValues: {
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      role: candidate.role,
      department: candidate.department,
      location: candidate.location,
      status: candidate.status as any,
      experienceYears: candidate.experienceYears,
      expectedCtc: candidate.expectedCtc,
      currentCtc: candidate.currentCtc,
      noticePeriodDays: candidate.noticePeriodDays,
      skills: candidate.skills.join(", "),
      resumeUrl: candidate.resumeUrl ?? "",
      notes: candidate.notes ?? "",
      recruiterId: candidate.recruiterName ? "" : "",
    },
  });

  async function onSubmit(values: CandidateUpdateInput) {
    setError(null);

    try {
      await apiFetch(`/api/candidates/${candidate.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          skills: values.skills ?? "",
          resumeUrl: values.resumeUrl || undefined,
          notes: values.notes || undefined,
        }),
      });
      toast({
        title: "Candidate updated",
        description: "Changes were saved successfully.",
        variant: "success",
      });
      router.push(`/candidates/${candidate.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save candidate.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Edit candidate profile</h1>
        <p className="text-sm text-slate-400">Update contact, role, and pipeline details for this candidate.</p>
      </div>

      {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Full name</label>
          <Input placeholder="Jane Doe" {...register("fullName")} />
          {errors.fullName ? <p className="mt-2 text-sm text-rose-300">{errors.fullName.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Email address</label>
          <Input type="email" placeholder="jane.doe@example.com" {...register("email")} />
          {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Phone</label>
          <Input placeholder="555-123-4567" {...register("phone")} />
          {errors.phone ? <p className="mt-2 text-sm text-rose-300">{errors.phone.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Role</label>
          <Input placeholder="Senior Product Manager" {...register("role")} />
          {errors.role ? <p className="mt-2 text-sm text-rose-300">{errors.role.message}</p> : null}
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
          <label className="mb-2 block text-sm font-medium text-slate-400">Status</label>
          <Select {...register("status")}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          {errors.status ? <p className="mt-2 text-sm text-rose-300">{errors.status.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Location</label>
          <Input placeholder="New York" {...register("location")} />
          {errors.location ? <p className="mt-2 text-sm text-rose-300">{errors.location.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Recruiter ID</label>
          <Input placeholder="Optional recruiter ID" {...register("recruiterId")} />
          {errors.recruiterId ? <p className="mt-2 text-sm text-rose-300">{errors.recruiterId.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Experience years</label>
          <Input type="number" min={0} {...register("experienceYears", { valueAsNumber: true })} />
          {errors.experienceYears ? <p className="mt-2 text-sm text-rose-300">{errors.experienceYears.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Expected CTC</label>
          <Input type="number" min={0} step="0.01" {...register("expectedCtc", { valueAsNumber: true })} />
          {errors.expectedCtc ? <p className="mt-2 text-sm text-rose-300">{errors.expectedCtc.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Current CTC</label>
          <Input type="number" min={0} step="0.01" {...register("currentCtc", { valueAsNumber: true })} />
          {errors.currentCtc ? <p className="mt-2 text-sm text-rose-300">{errors.currentCtc.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Notice period (days)</label>
          <Input type="number" min={0} {...register("noticePeriodDays", { valueAsNumber: true })} />
          {errors.noticePeriodDays ? <p className="mt-2 text-sm text-rose-300">{errors.noticePeriodDays.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Skills</label>
          <Input placeholder="JavaScript, React, Node" {...register("skills")} />
          {errors.skills ? <p className="mt-2 text-sm text-rose-300">{errors.skills.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Resume URL</label>
          <Input placeholder="https://" {...register("resumeUrl")} />
          {errors.resumeUrl ? <p className="mt-2 text-sm text-rose-300">{errors.resumeUrl.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Notes</label>
          <textarea
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
            rows={5}
            {...register("notes")}
          />
          {errors.notes ? <p className="mt-2 text-sm text-rose-300">{errors.notes.message}</p> : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
