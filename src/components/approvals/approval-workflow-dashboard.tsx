'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ApprovalListItem } from "@/types/approval";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, CalendarDays, Clock3, FileText, Info, ShieldCheck, ShieldAlert, TrendingUp, Users } from "lucide-react";

type ApprovalWorkflowDashboardProps = {
  approvals: ApprovalListItem[];
  selectedStatus: string;
};

const statusStages = ["PENDING", "APPROVED", "REJECTED"] as const;

function getStatusTone(status: string) {
  if (status === "APPROVED") return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
  if (status === "REJECTED") return "bg-rose-500/10 text-rose-300 border border-rose-500/20";
  return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
}

function getSlaIndicator(due: string) {
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Overdue", tone: "bg-rose-500/15 text-rose-300" };
  if (days <= 2) return { label: "1-2 days left", tone: "bg-amber-500/15 text-amber-300" };
  return { label: `${days} days`, tone: "bg-emerald-500/10 text-emerald-300" };
}

export function ApprovalWorkflowDashboard({ approvals, selectedStatus }: ApprovalWorkflowDashboardProps) {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalListItem | null>(approvals[0] ?? null);

  const analytics = useMemo(() => {
    const total = approvals.length;
    const pending = approvals.filter((approval) => approval.status === "PENDING").length;
    const approved = approvals.filter((approval) => approval.status === "APPROVED").length;
    const rejected = approvals.filter((approval) => approval.status === "REJECTED").length;
    const escalations = approvals.filter((approval) => {
      const days = Math.ceil((new Date(approval.due).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 2;
    }).length;
    const overdue = approvals.filter((approval) => new Date(approval.due).getTime() < Date.now()).length;
    return { total, pending, approved, rejected, escalations, overdue };
  }, [approvals]);

  const activityStream = useMemo(
    () => approvals.slice(0, 5).map((approval) => ({
      id: approval.id,
      label: `${approval.offerTitle} assigned to ${approval.approverName}`,
      when: approval.decidedAt ? new Date(approval.decidedAt).toLocaleDateString() : new Date(approval.due).toLocaleDateString(),
      status: approval.status,
    })),
    [approvals]
  );

  if (!approvals.length) {
    return (
      <div className="col-span-full">
        <EmptyState
          title="Approval workflow is clear"
          description="No approvals are pending review right now. Route your next offer through approval to see timeline and reviewer insights here."
          actionLabel="Create new offer"
          onAction={() => window.location.assign('/offers/new')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 xl:grid-cols-[0.66fr_0.34fr]">
        <div className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Workflow analytics</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Premium approval health</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-4 py-2 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              {selectedStatus ? `${selectedStatus} approvals filtered` : 'All approvals'}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {[
              { label: 'In queue', value: analytics.total, icon: Briefcase, tone: 'text-white' },
              { label: 'Pending', value: analytics.pending, icon: CalendarDays, tone: 'text-amber-300' },
              { label: 'Escalations', value: analytics.escalations, icon: ShieldAlert, tone: 'text-rose-300' },
              { label: 'Overdue', value: analytics.overdue, icon: Clock3, tone: 'text-rose-300' },
            ].map((card) => (
              <motion.div key={card.label} whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
                  <card.icon className={`h-5 w-5 ${card.tone}`} />
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{card.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Reviewer ownership</span>
              <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">Active reviewers</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {approvals.slice(0, 3).map((approval) => (
                <div key={approval.id} className="rounded-3xl bg-slate-950/90 p-4">
                  <p className="text-sm text-slate-400">{approval.approverName}</p>
                  <p className="mt-2 font-semibold text-white">{approval.offerTitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Approval activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Recent review stream</h2>
            </div>
            <TrendingUp className="h-6 w-6 text-cyan-300" />
          </div>

          <div className="mt-6 space-y-4">
            {activityStream.map((event) => (
              <motion.div key={event.id} whileHover={{ x: 3 }} transition={{ duration: 0.18 }} className="rounded-[24px] border border-slate-800/90 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                  <span>{event.label}</span>
                  <span>{event.when}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{event.status === 'APPROVED' ? 'Approved review completed' : event.status === 'REJECTED' ? 'Review declined' : 'Awaiting reviewer decision'}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[0.68fr_0.32fr]">
        <div className="space-y-5">
          {approvals.map((item) => {
            const sla = getSlaIndicator(item.due);
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setSelectedApproval(item)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`group w-full rounded-[32px] border ${selectedApproval?.id === item.id ? 'border-cyan-400/30 bg-slate-900/95 shadow-[0_20px_80px_rgba(8,15,32,0.35)]' : 'border-slate-800/90 bg-slate-900/80'} p-6 text-left transition`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 uppercase tracking-[0.22em] text-xs text-slate-300">{item.stage}</span>
                      <Badge className={getStatusTone(item.status)}>{item.status}</Badge>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-white">{item.offerTitle}</h3>
                    <p className="mt-2 text-sm text-slate-500">Assigned to {item.approverName}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sla.tone}`}>{sla.label}</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-2 text-xs text-slate-300"><CalendarDays className="h-4 w-4" /> Due {new Date(item.due).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {statusStages.map((stage) => {
                    const active = stage === item.status;
                    return (
                      <div key={stage} className={`rounded-3xl px-3 py-2 text-center text-xs uppercase tracking-[0.18em] ${active ? 'bg-cyan-500/10 text-cyan-200' : 'bg-slate-950/90 text-slate-500'}`}>
                        {stage}
                      </div>
                    );
                  })}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Approval details</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Approval history</h2>
              </div>
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
            </div>

            {selectedApproval ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Reviewer</p>
                      <p className="mt-2 font-semibold text-white">{selectedApproval.approverName}</p>
                    </div>
                    <div className="rounded-full bg-slate-950/90 px-4 py-2 text-sm text-slate-200">Reviewer owned</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">This approval is assigned to a dedicated reviewer and includes SLA tracking for timely decisioning.</p>
                </div>

                <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Approval timeline</p>
                    <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">Stage map</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { name: 'Request created', active: true },
                      { name: 'Reviewer assigned', active: true },
                      { name: 'Decision pending', active: selectedApproval.status === 'PENDING' },
                    ].map((step, index) => (
                      <div key={step.name} className="flex items-center gap-3">
                        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${step.active ? 'bg-cyan-400' : 'bg-slate-800'}`}>
                          <span className="block h-2 w-2 rounded-full bg-white" />
                        </span>
                        <div className="flex-1">
                          <p className={`text-sm ${step.active ? 'text-white' : 'text-slate-500'}`}>{step.name}</p>
                          <p className="text-xs text-slate-500">{index === 0 ? 'Offer routed into approval queue' : index === 1 ? 'Assigned reviewer is notified' : 'Awaiting decision from reviewer'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Comments</p>
                      <p className="mt-2 text-base font-semibold text-white">Review notes</p>
                    </div>
                    <Info className="h-5 w-5 text-cyan-300" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">Use this panel to surface key context from prior review cycles, escalation triggers, and decision rationale.</p>
                  <div className="mt-4 rounded-[24px] bg-slate-950/90 p-4 text-sm text-slate-300">
                    {selectedApproval.decidedAt ? 'Final decision recorded and comments archived in offer history.' : 'No comments yet. Reviewers can add feedback when they approve or reject.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-8 text-center text-slate-400">
                Select an approval card to view the workflow timeline, comments, and escalation details.
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">SLA indicators</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Service level insights</h2>
            </div>
            <Clock3 className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="text-sm text-slate-400">Approvals due soon</p>
              <p className="mt-3 text-3xl font-semibold text-white">{analytics.escalations}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="text-sm text-slate-400">Overdue approvals</p>
              <p className="mt-3 text-3xl font-semibold text-white">{analytics.overdue}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Reviewer ownership</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Reviewer roster</h2>
            </div>
            <Users className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-6 space-y-3">
            {approvals.slice(0, 4).map((approval) => (
              <div key={approval.id} className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">{approval.offerTitle}</p>
                <p className="mt-2 font-semibold text-white">{approval.approverName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{approval.status}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Approval history</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Review tracker</h2>
            </div>
            <FileText className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-6 text-sm text-slate-400">
            <p className="text-slate-400">Selected approval records will display here once a card is opened. Track decisions, comments, and escalation history in one premium pane.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
