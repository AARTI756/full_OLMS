import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { offerCreateSchema, offerListSchema } from "@/validators/offers";
import { createOffer, getOfferList } from "@/services/offer-service";
import { getCandidateById } from "@/services/candidate-service";
import { notifyOfferCreated } from "@/services/notification-service";
import { sendOfferCreatedEmail, sendApprovalRequestEmail } from "@/services/email-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request.url);
  const parsed = offerListSchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    department: url.searchParams.get("department") ?? undefined,
    recruiter: url.searchParams.get("recruiter") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortOrder: url.searchParams.get("sortOrder") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = await getOfferList(parsed.data);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const parsed = offerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid offer payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const created = await createOffer({ ...parsed.data, createdById: auth.id });
  await notifyOfferCreated(auth.id, created.id, created.title);

  const candidate = await getCandidateById(parsed.data.candidateId);
  const candidateName = candidate?.fullName ?? 'Candidate';
  const candidateEmail = candidate?.email ?? '';
  const departmentName = parsed.data.department;
  const offerLink = `${process.env.SITE_URL ?? 'http://localhost:3000'}/offers/${created.id}`;

  await sendOfferCreatedEmail(
    {
      id: created.id,
      title: created.title,
      designation: created.designation,
      departmentName,
      candidateName,
      candidateEmail,
      candidatePhone: candidate?.phone ?? '',
      status: created.status,
      baseSalary: created.baseSalary,
      variablePay: created.variablePay,
      joiningBonus: created.joiningBonus,
      retentionBonus: created.retentionBonus,
      probationPeriodMonths: created.probationPeriodMonths,
      offerDate: created.offerDate.toISOString(),
      validUntil: created.validUntil.toISOString(),
      totalCtc: created.totalCtc,
      version: created.version,
      approvalComments: created.approvalComments,
      candidateId: created.candidateId,
      templateId: created.templateId,
      templateTitle: created.templateTitle ?? null,
      approvals: [],
      createdByEmail: auth.email,
      createdByName: auth.name,
    } as any,
    auth.name,
    auth.email,
    offerLink
  );

  if ((created as any).approverEmail && (created as any).approverName) {
    await sendApprovalRequestEmail(
      {
        id: created.id,
        title: created.title,
        designation: created.designation,
        departmentName,
        candidateName,
        candidateEmail,
        candidatePhone: candidate?.phone ?? '',
        status: created.status,
        baseSalary: created.baseSalary,
        variablePay: created.variablePay,
        joiningBonus: created.joiningBonus,
        retentionBonus: created.retentionBonus,
        probationPeriodMonths: created.probationPeriodMonths,
        offerDate: created.offerDate.toISOString(),
        validUntil: created.validUntil.toISOString(),
        totalCtc: created.totalCtc,
        version: created.version,
        approvalComments: created.approvalComments,
        candidateId: created.candidateId,
        templateId: created.templateId,
        templateTitle: created.templateTitle ?? null,
        approvals: [],
      } as any,
      (created as any).approverName,
      (created as any).approverEmail,
      offerLink
    );
  }

  return NextResponse.json({ id: created.id }, { status: 201 });
}
