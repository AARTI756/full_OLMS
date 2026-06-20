import { AppShell } from "@/components/shared/app-shell";
import { Select } from "@/components/ui/select";
import { ApprovalWorkflowDashboard } from "@/components/approvals/approval-workflow-dashboard";
import { getApprovalList } from "@/services/approval-service";
import type { ApprovalDecision } from "@/types/approval";

const approvalStatuses = ["", "PENDING", "APPROVED", "REJECTED"];

export default async function ApprovalsPage({ searchParams }: { searchParams: { status?: string } }) {
  const selectedStatus = searchParams.status ?? "";
  const normalizedStatus: ApprovalDecision | "" = ["PENDING", "APPROVED", "REJECTED"].includes(selectedStatus)
    ? (selectedStatus as ApprovalDecision)
    : "";
  const approvals = await getApprovalList({ status: normalizedStatus || undefined });

  return (
    <AppShell>
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Approval workflow</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Approval queue</h1>
          </div>
          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
              <label htmlFor="status" className="font-medium text-slate-200">Filter</label>
              <Select id="status" name="status" defaultValue={normalizedStatus}>
                <option value="">All approvals</option>
                {approvalStatuses.filter(Boolean).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>
            <button type="submit" className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Apply
            </button>
          </form>
        </div>
      </div>
      <ApprovalWorkflowDashboard approvals={approvals.data} selectedStatus={selectedStatus} />
    </AppShell>
  );
}
