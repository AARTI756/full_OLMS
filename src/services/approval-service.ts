import { prisma } from "@/prisma/client";
import type { ApprovalListFilters, ApprovalListResponse } from "@/types/approval";
import type { ApprovalDecision } from "@prisma/client";
import { createActivity } from '@/services/activity-service';

export async function getApprovalList(filters: ApprovalListFilters = {}): Promise<ApprovalListResponse> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 50) : 12;
  const skip = (page - 1) * limit;

  const where = filters.status ? { decision: filters.status as ApprovalDecision } : undefined;

  const [total, approvals] = await prisma.$transaction([
    prisma.approval.count({ where }),
    prisma.approval.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        offer: { select: { id: true, title: true, validUntil: true } },
        approver: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
    }),
  ]);

  return {
    total,
    data: approvals.map((approval) => ({
      id: approval.id,
      offerId: approval.offer.id,
      offerTitle: approval.offer.title,
      stage: approval.decision === "PENDING" ? "Review" : "Final approval",
      status: approval.decision,
      approverId: approval.approver.id,
      approverName: approval.approver.name,
      due: approval.offer.validUntil.toISOString(),
      decidedAt: approval.decidedAt?.toISOString() ?? null,
    })),
  };
}

export async function createApproval(offerId: string, data: {
  approverId: string;
  decision: ApprovalDecision;
  comments?: string | null;
}) {
  const approver = await prisma.user.findUnique({ where: { id: data.approverId } });

  if (!approver) {
    throw new Error("Authenticated approver not found.");
  }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { approvals: true },
  });

  if (!offer) {
    throw new Error("Offer not found.");
  }

  const updatedOffer = await prisma.$transaction(async (tx) => {
    const offerRecord = await tx.offer.update({
      where: { id: offerId },
      data: {
        status: data.decision === "PENDING" ? "PENDING" : data.decision,
        approvalComments: data.comments,
        approvals: {
          create: {
            approverId: approver.id,
            decision: data.decision,
            comments: data.comments,
            decidedAt: data.decision === "PENDING" ? null : new Date(),
          },
        },
      },
    });

    await tx.activity.create({
      data: {
        userId: approver.id,
        offerId,
        candidateId: offer.candidateId,
        action: data.decision === "PENDING" ? "OFFER_APPROVAL_REQUESTED" : "OFFER_APPROVAL_DECIDED",
        details:
          data.decision === "PENDING"
            ? `Approval requested for offer ${offer.title}`
            : `Offer ${offer.title} marked as ${data.decision}`,
      },
    });

    return offerRecord;
  });

  return updatedOffer;
}
