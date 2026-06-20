import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { approvalActionSchema } from "@/validators/approvals";
import { createApproval } from "@/services/approval-service";
import { getOfferById } from "@/services/offer-service";
import { notifyOfferStatusChange } from "@/services/notification-service";import { sendApprovalCompletedEmail } from '@/services/email-service';import { NotificationType } from "@prisma/client";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const offer = await getOfferById(id);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = approvalActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid approval payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const isPendingRequest = parsed.data.decision === "PENDING";
  const canWriteFinalDecision = ["ADMIN", "HR", "FINANCE", "APPROVER"].includes(auth.role);

  if (!isPendingRequest && !canWriteFinalDecision) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const approval = await createApproval(id, {
      ...parsed.data,
      approverId: auth.id,
    });

    if (parsed.data.decision === "APPROVED") {
      await notifyOfferStatusChange(
        approval.createdById,
        id,
        approval.title,
        NotificationType.APPROVAL,
        `Your offer '${approval.title}' was approved.`,
        "OFFER_APPROVED"
      );

      if (offer.createdByEmail) {
        await sendApprovalCompletedEmail(
          offer,
          "APPROVED",
          offer.createdByName ?? "Recruiter",
          offer.createdByEmail,
          `${process.env.SITE_URL ?? 'http://localhost:3000'}/offers/${id}`
        );
      }
    }

    if (parsed.data.decision === "REJECTED") {
      await notifyOfferStatusChange(
        approval.createdById,
        id,
        approval.title,
        NotificationType.APPROVAL,
        `Your offer '${approval.title}' was rejected.`,
        "OFFER_REJECTED"
      );

      if (offer.createdByEmail) {
        await sendApprovalCompletedEmail(
          offer,
          "REJECTED",
          offer.createdByName ?? "Recruiter",
          offer.createdByEmail,
          `${process.env.SITE_URL ?? 'http://localhost:3000'}/offers/${id}`
        );
      }
    }

    return NextResponse.json({ message: "Approval recorded" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Approval failed" }, { status: 500 });
  }
}
