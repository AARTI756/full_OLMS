import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getOfferById, updateOffer } from "@/services/offer-service";
import { offerCreateSchema } from "@/validators/offers";
import { notifyOfferStatusChange } from "@/services/notification-service";
import { NotificationType } from "@prisma/client";

export async function GET(
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

  return NextResponse.json(offer);
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const currentOffer = await getOfferById(id);
  if (!currentOffer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = offerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid offer payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await updateOffer(id, parsed.data);

  if (parsed.data.status !== currentOffer.status) {
    if (parsed.data.status === "RELEASED") {
      await notifyOfferStatusChange(
        currentOffer.createdById,
        id,
        currentOffer.title,
        NotificationType.OFFER,
        `Your offer '${currentOffer.title}' has been sent.
`,
        "OFFER_SENT"
      );
    }

    if (parsed.data.status === "ACCEPTED") {
      await notifyOfferStatusChange(
        currentOffer.createdById,
        id,
        currentOffer.title,
        NotificationType.CANDIDATE,
        `Candidate accepted the offer '${currentOffer.title}'.`,
        "CANDIDATE_ACCEPTED_OFFER"
      );
    }

    if (parsed.data.status === "REJECTED") {
      await notifyOfferStatusChange(
        currentOffer.createdById,
        id,
        currentOffer.title,
        NotificationType.APPROVAL,
        `Your offer '${currentOffer.title}' was rejected.`,
        "OFFER_REJECTED"
      );
    }
  }

  return NextResponse.json({ id: updated.id });
}
