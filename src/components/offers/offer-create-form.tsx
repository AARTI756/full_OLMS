'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/toast";
import { offerCreateSchema } from "@/validators/offers";
import type { z } from "zod";
import type { CandidateListItem } from "@/types/candidate";
import type { OfferTemplateItem } from "@/types/template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type OfferCreateInput = z.infer<typeof offerCreateSchema>;

type OfferCreateFormProps = {
  candidates: CandidateListItem[];
  templates: OfferTemplateItem[];
};

const statuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "RELEASED", "ACCEPTED", "DECLINED"];
const departments = ["Engineering", "HR", "Sales", "Marketing", "Finance"];

export function OfferCreateForm({ candidates, templates }: OfferCreateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [hrSignaturePreview, setHrSignaturePreview] = useState<string | null>(null);
  const [companyLogoName, setCompanyLogoName] = useState<string | null>(null);
  const [hrSignatureName, setHrSignatureName] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const offerLetterRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(offerCreateSchema),
    defaultValues: {
      candidateId: candidates[0]?.id ?? "",
      createdById: user?.id,
      templateId: "",
      title: "",
      department: "Engineering",
      designation: "",
      status: "DRAFT",
      baseSalary: 0,
      variablePay: 0,
      joiningBonus: 0,
      retentionBonus: 0,
      probationPeriodMonths: 0,
      offerDate: new Date().toISOString().slice(0, 10),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
      approvalComments: "",
      signatoryName: "",
      signatoryDesignation: "",
      signatureDate: new Date().toISOString().slice(0, 10),
    },
  });

  const [baseSalary, variablePay, joiningBonus, retentionBonus, signatoryName, signatoryDesignation, signatureDate, candidateId, offerTitle] = watch([
    "baseSalary",
    "variablePay",
    "joiningBonus",
    "retentionBonus",
    "signatoryName",
    "signatoryDesignation",
    "signatureDate",
    "candidateId",
    "title",
  ]) as [number, number, number, number, string, string, string, string, string];

  const selectedCandidate = candidates.find((candidate) => candidate.id === candidateId);

  const totalCtc = useMemo(
    () => baseSalary + variablePay + joiningBonus + retentionBonus,
    [baseSalary, variablePay, joiningBonus, retentionBonus]
  );

  useEffect(() => {
    return () => {
      if (companyLogoPreview) {
        URL.revokeObjectURL(companyLogoPreview);
      }
      if (hrSignaturePreview) {
        URL.revokeObjectURL(hrSignaturePreview);
      }
    };
  }, [companyLogoPreview, hrSignaturePreview]);

  const companyLogoRegistration = register("companyLogo");
  const hrSignatureRegistration = register("hrSignature");

  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setName?: React.Dispatch<React.SetStateAction<string | null>>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreview(null);
      setName?.(null);
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Only PNG or JPG images are allowed.");
      event.target.value = "";
      setPreview(null);
      setName?.(null);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setName?.(file.name ?? null);
  }

  async function handleDownloadPdf() {
    if (!offerLetterRef.current) {
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(offerLetterRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("offer-letter.pdf");
    } catch (downloadError) {
      setError("Unable to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function onSubmit(values: OfferCreateInput) {
    setError(null);

    try {
      await apiFetch<{ id: string }>("/api/offers", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          createdById: user?.id,
          templateId: values.templateId || null,
        }),
      });
      toast({
        title: "Offer created",
        description: "The offer has been added to the pipeline.",
        variant: "success",
      });
      router.push("/offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create offer.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Create new offer</h1>
        <p className="text-sm text-slate-400">Build an offer and assign it to a candidate for approval.</p>
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
      </div>

      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Quick pick</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templates.slice(0, 6).map((template) => {
            const isSelected = watch("templateId") === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setValue("templateId", template.id)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected ? "border-cyan-500 bg-slate-900" : "border-slate-800 bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">{template.title}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                    {isSelected ? "Selected" : "Choose"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400 line-clamp-3">{template.description ?? "A ready-to-use offer letter format."}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-700 px-2 py-1">{template.category}</span>
                  <span>{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : "New"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
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

      <div className="border-t border-slate-800/60 pt-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Authorized Signature</h2>
        <div className="grid gap-4 xl:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Signatory name</label>
            <Input placeholder="John Doe" {...register("signatoryName")} />
            {errors.signatoryName ? <p className="mt-2 text-sm text-rose-300">{errors.signatoryName.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Designation</label>
            <Input placeholder="CEO" {...register("signatoryDesignation")} />
            {errors.signatoryDesignation ? <p className="mt-2 text-sm text-rose-300">{errors.signatoryDesignation.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Signature date</label>
            <Input type="date" {...register("signatureDate")} />
            {errors.signatureDate ? <p className="mt-2 text-sm text-rose-300">{errors.signatureDate.message}</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Company logo</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-200 cursor-pointer hover:bg-slate-700">
              Choose file
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                {...companyLogoRegistration}
                onChange={(event) => {
                  handleImageUpload(event, setCompanyLogoPreview, setCompanyLogoName);
                  companyLogoRegistration.onChange?.(event);
                }}
              />
            </label>
            <span className="text-sm text-slate-400">PNG or JPG only.</span>
          </div>
          {companyLogoName ? (
            <div className="mt-2 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{companyLogoName}</div>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">HR signature image</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-200 cursor-pointer hover:bg-slate-700">
              Choose file
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                {...hrSignatureRegistration}
                onChange={(event) => {
                  handleImageUpload(event, setHrSignaturePreview, setHrSignatureName);
                  hrSignatureRegistration.onChange?.(event);
                }}
              />
            </label>
            <span className="text-sm text-slate-400">PNG or JPG only.</span>
          </div>
          {hrSignatureName ? (
            <div className="mt-2 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{hrSignatureName}</div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-800/60 pt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Offer Letter Preview</h2>
            <p className="text-sm text-slate-400">Review the letter layout before download.</p>
          </div>
          <Button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            disabled={isDownloading}
          >
            {isDownloading ? "Preparing PDF..." : "Download Offer PDF"}
          </Button>
        </div>

        <div ref={offerLetterRef} className="mt-5 rounded-3xl border border-slate-800/90 bg-slate-950/90 p-6">
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-800/80">
            <div className="h-20 w-40 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 flex items-center justify-center">
              {companyLogoPreview ? (
                <img src={companyLogoPreview} alt="Company logo preview" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-xs text-slate-500">Company logo</div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Offer Letter</p>
              <p className="mt-2 text-lg font-semibold text-white">{offerTitle || "Offer Title"}</p>
              <p className="text-sm text-slate-400">{selectedCandidate?.fullName || "Candidate Name"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-slate-300">
            <p>Dear {selectedCandidate?.fullName || "Candidate Name"},</p>
            <p>
              We are pleased to offer you the position of <span className="font-semibold text-white">{offerTitle || "Position Title"}</span>.
            </p>
            <p>We look forward to welcoming you to the team.</p>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4 text-slate-300">
            <p className="text-sm font-semibold text-white">Compensation</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-400">Base salary</div>
              <div className="text-white">${baseSalary?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              <div className="text-slate-400">Variable pay</div>
              <div className="text-white">${variablePay?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              <div className="text-slate-400">Joining bonus</div>
              <div className="text-white">${joiningBonus?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              <div className="text-slate-400">Retention bonus</div>
              <div className="text-white">${retentionBonus?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              <div className="text-slate-400">Total CTC</div>
              <div className="text-white font-semibold">${totalCtc.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4 text-slate-300">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Authorized signature</p>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-[220px]">
                <div className="text-sm font-semibold text-white">{signatoryName || "[Signatory Name]"}</div>
                <div className="text-xs text-slate-400">{signatoryDesignation || "[Designation]"}</div>
                <div className="mt-3 h-16 w-40 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2">
                  {hrSignaturePreview ? (
                    <img src={hrSignaturePreview} alt="HR signature preview" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">HR signature</div>
                  )}
                </div>
              </div>
              <div className="sm:ml-6 text-xs text-slate-400">Date: {signatureDate ? new Date(signatureDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "[Date]"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting}>
          {isSubmitting ? "Creating offer..." : "Create offer"}
        </Button>
      </div>
    </form>
  );
}
