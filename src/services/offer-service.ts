import { prisma } from "@/prisma/client";
import type { Prisma } from "@prisma/client";
import type { OfferListResponse } from "@/types/offer";
import { OfferStatus, NotificationType } from "@prisma/client";
import type { OfferSortBy, SortOrder } from "@/types/offer";
import { createActivity } from "@/services/activity-service";
import { notifyApprovalRequested, notifyOfferStatusChange } from '@/services/notification-service';
import { sendOfferStatusNotificationEmail } from '@/services/email-service';

export async function getOfferList(params: {
  search?: string;
  status?: string;
  department?: string;
  recruiter?: string;
  page?: number;
  limit?: number;
  sortBy?: OfferSortBy;
  sortOrder?: SortOrder;
}): Promise<OfferListResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 12;
  const skip = (page - 1) * limit;
  const sortBy = params.sortBy ?? "offerDate";
  const sortOrder = params.sortOrder ?? "desc";

  const orderBy =
    sortBy === "validUntil"
      ? { validUntil: sortOrder }
      : sortBy === "totalCtc"
      ? { totalCtc: sortOrder }
      : sortBy === "status"
      ? { status: sortOrder }
      : sortBy === "title"
      ? { title: sortOrder }
      : { offerDate: sortOrder };

  const conditions: Record<string, unknown>[] = [];
  if (params.status) {
    conditions.push({ status: params.status as OfferStatus });
  }

  if (params.department) {
    conditions.push({ department: { name: params.department } });
  }

  if (params.recruiter) {
    conditions.push({ candidate: { recruiter: { name: { contains: params.recruiter, mode: 'insensitive' } } } });
  }

  if (params.search) {
    conditions.push({
      OR: [
        { title: { contains: params.search, mode: "insensitive" } },
        { designation: { contains: params.search, mode: "insensitive" } },
        { department: { name: { contains: params.search, mode: "insensitive" } } },
        { candidate: { fullName: { contains: params.search, mode: "insensitive" } } },
      ],
    });
  }

  const where = conditions.length ? { AND: conditions } : {};

  const [total, offers] = await prisma.$transaction([
    prisma.offer.count({ where }),
    prisma.offer.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        candidate: { select: { fullName: true } },
        department: { select: { name: true } },
      },
    }),
  ]);

  return {
    total,
    data: offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      department: offer.department?.name ?? "Unknown",
      designation: offer.designation,
      status: offer.status,
      totalCtc: offer.totalCtc,
      offerDate: offer.offerDate.toISOString(),
      validUntil: offer.validUntil.toISOString(),
      candidateName: offer.candidate.fullName,
      version: offer.version,
    })),
  };
}

export async function getOfferById(id: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, fullName: true, email: true, phone: true } },
      department: { select: { name: true } },
      template: { select: { title: true } },
      approvals: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          decision: true,
          comments: true,
          decidedAt: true,
          approver: { select: { name: true } },
        },
      },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!offer) {
    return null;
  }

  return {
    id: offer.id,
    title: offer.title,
    department: offer.department?.name ?? "Unknown",
    designation: offer.designation,
    status: offer.status,
    baseSalary: offer.baseSalary,
    variablePay: offer.variablePay,
    joiningBonus: offer.joiningBonus,
    retentionBonus: offer.retentionBonus,
    probationPeriodMonths: offer.probationPeriodMonths,
    offerDate: offer.offerDate.toISOString(),
    validUntil: offer.validUntil.toISOString(),
    totalCtc: offer.totalCtc,
    version: offer.version,
    approvalComments: offer.approvalComments,
    candidateId: offer.candidate.id,
    candidateName: offer.candidate.fullName,
    candidateEmail: offer.candidate.email,
    candidatePhone: offer.candidate.phone,
    departmentName: offer.department?.name ?? "Unknown",
    templateId: offer.templateId,
    templateTitle: offer.template?.title ?? null,
    createdById: offer.creator.id,
    approvals: offer.approvals.map((approval) => ({
      id: approval.id,
      decision: approval.decision,
      comments: approval.comments,
      approverName: approval.approver.name,
      decidedAt: approval.decidedAt?.toISOString() ?? null,
    })),
    createdByEmail: offer.creator?.email ?? null,
    createdByName: offer.creator?.name ?? null,
  };
}

export async function createOffer(data: {
  candidateId: string;
  createdById: string;
  templateId?: string | null;
  title: string;
  department: string;
  designation: string;
  status: string;
  baseSalary: number;
  variablePay: number;
  joiningBonus: number;
  retentionBonus: number;
  probationPeriodMonths: number;
  offerDate: string;
  validUntil: string;
  approvalComments?: string | null;
}) {
  const departmentCode = data.department.trim().slice(0, 3).toUpperCase().padEnd(3, "X");

  const department = await prisma.department.upsert({
    where: { name: data.department },
    update: {},
    create: {
      name: data.department,
      code: departmentCode,
      description: `${data.department} department`,
    },
  });

  const creator = await prisma.user.findUnique({ select: { id: true }, where: { id: data.createdById } });

  if (!creator) {
    throw new Error("Authenticated offer creator not found.");
  }

  let templateVersionId: string | undefined = undefined;
  if (data.templateId) {
    const template = await prisma.offerTemplate.findUnique({
      where: { id: data.templateId },
      select: { latestVersionId: true },
    });
    if (!template) {
      throw new Error("Selected template not found.");
    }
    templateVersionId = template.latestVersionId ?? undefined;
  }

  const createdOffer = await prisma.offer.create({
    data: {
      candidateId: data.candidateId,
      createdById: creator.id,
      templateId: data.templateId ?? undefined,
      templateVersionId,
      title: data.title,
      departmentId: department.id,
      designation: data.designation,
      status: data.status as OfferStatus,
      baseSalary: data.baseSalary,
      variablePay: data.variablePay,
      joiningBonus: data.joiningBonus,
      retentionBonus: data.retentionBonus,
      probationPeriodMonths: data.probationPeriodMonths,
      offerDate: new Date(data.offerDate),
      validUntil: new Date(data.validUntil),
      totalCtc: data.baseSalary + data.variablePay + data.joiningBonus + data.retentionBonus,
      approvalComments: data.approvalComments,
      version: 1,
    } as Prisma.OfferUncheckedCreateInput,
  });

  await createActivity({
    userId: creator.id,
    action: 'OFFER_CREATED',
    details: `Offer created for ${createdOffer.title}`,
    offerId: createdOffer.id,
    candidateId: createdOffer.candidateId,
  });

  let approver: { id: string; email: string; name: string } | null = null;
  if (createdOffer.status !== OfferStatus.DRAFT) {
    approver = await prisma.user.findFirst({
      where: { role: { name: 'APPROVER' }, isActive: true },
      select: { id: true, email: true, name: true },
    });

    if (approver) {
      await prisma.approval.create({
        data: {
          offerId: createdOffer.id,
          approverId: approver.id,
          decision: 'PENDING',
          comments: 'Requested an approval review before release.',
        },
      });

      await createActivity({
        userId: approver.id,
        action: 'OFFER_APPROVAL_REQUESTED',
        details: `Approval requested for ${createdOffer.title}`,
        offerId: createdOffer.id,
        candidateId: createdOffer.candidateId,
      });

      await notifyApprovalRequested(approver.id, createdOffer.id, createdOffer.title);
    }
  }

  return {
    ...createdOffer,
    approverEmail: approver?.email ?? null,
    approverName: approver?.name ?? null,
  } as any;
}

export async function updateOffer(id: string, data: {
  candidateId: string;
  templateId?: string | null;
  title: string;
  department: string;
  designation: string;
  status: string;
  baseSalary: number;
  variablePay: number;
  joiningBonus: number;
  retentionBonus: number;
  probationPeriodMonths: number;
  offerDate: string;
  validUntil: string;
  approvalComments?: string | null;
}) {
  const departmentCode = data.department.trim().slice(0, 3).toUpperCase().padEnd(3, "X");

  const department = await prisma.department.upsert({
    where: { name: data.department },
    update: {},
    create: {
      name: data.department,
      code: departmentCode,
      description: `${data.department} department`,
    },
  });

  let templateVersionId: string | undefined = undefined;
  if (data.templateId) {
    const template = await prisma.offerTemplate.findUnique({
      where: { id: data.templateId },
      select: { latestVersionId: true },
    });
    if (!template) {
      throw new Error("Selected template not found.");
    }
    templateVersionId = template.latestVersionId ?? undefined;
  }

  const updatedOffer = await prisma.offer.update({
    where: { id },
    data: {
      candidateId: data.candidateId,
      templateId: data.templateId ?? undefined,
      templateVersionId,
      title: data.title,
      departmentId: department.id,
      designation: data.designation,
      status: data.status as OfferStatus,
      baseSalary: data.baseSalary,
      variablePay: data.variablePay,
      joiningBonus: data.joiningBonus,
      retentionBonus: data.retentionBonus,
      probationPeriodMonths: data.probationPeriodMonths,
      offerDate: new Date(data.offerDate),
      validUntil: new Date(data.validUntil),
      totalCtc: data.baseSalary + data.variablePay + data.joiningBonus + data.retentionBonus,
      approvalComments: data.approvalComments,
    } as Prisma.OfferUncheckedUpdateInput,
  });

  if (data.status === OfferStatus.ACCEPTED) {
    await prisma.candidate.update({
      where: { id: updatedOffer.candidateId },
      data: { status: 'HIRED' },
    });

    await createActivity({
      userId: updatedOffer.createdById,
      action: 'OFFER_ACCEPTED',
      details: `Offer accepted for ${updatedOffer.title}`,
      offerId: updatedOffer.id,
      candidateId: updatedOffer.candidateId,
    });

    const offerDetail = await getOfferById(id);
    if (offerDetail && offerDetail.candidateEmail) {
      await sendOfferStatusNotificationEmail(
        offerDetail,
        'ACCEPTED',
        offerDetail.candidateName,
        offerDetail.candidateEmail,
        `${process.env.SITE_URL ?? 'http://localhost:3000'}/offers/${id}`
      );
    }

    await notifyOfferStatusChange(
      updatedOffer.createdById,
      updatedOffer.id,
      updatedOffer.title,
      NotificationType.APPROVAL,
      `Offer '${updatedOffer.title}' was accepted.`,
      'OFFER_ACCEPTED'
    );
  }

  if (data.status === OfferStatus.REJECTED) {
    await createActivity({
      userId: updatedOffer.createdById,
      action: 'OFFER_REJECTED',
      details: `Offer ${updatedOffer.title} was rejected`,
      offerId: updatedOffer.id,
      candidateId: updatedOffer.candidateId,
    });

    const offerDetail = await getOfferById(id);
    if (offerDetail && offerDetail.candidateEmail) {
      await sendOfferStatusNotificationEmail(
        offerDetail,
        'REJECTED',
        offerDetail.candidateName,
        offerDetail.candidateEmail,
        `${process.env.SITE_URL ?? 'http://localhost:3000'}/offers/${id}`
      );
    }

    await notifyOfferStatusChange(
      updatedOffer.createdById,
      updatedOffer.id,
      updatedOffer.title,
      NotificationType.APPROVAL,
      `Offer '${updatedOffer.title}' was rejected.`,
      'OFFER_REJECTED'
    );
  }

  if (data.status === OfferStatus.RELEASED) {
    const offerDetail = await getOfferById(id);
    if (offerDetail && offerDetail.candidateEmail) {
      await sendOfferStatusNotificationEmail(
        offerDetail,
        'RELEASED',
        offerDetail.candidateName,
        offerDetail.candidateEmail,
        `${process.env.SITE_URL ?? 'http://localhost:3000'}/offers/${id}`
      );
    }

    await notifyOfferStatusChange(
      updatedOffer.createdById,
      updatedOffer.id,
      updatedOffer.title,
      NotificationType.APPROVAL,
      `Offer '${updatedOffer.title}' was released.`,
      'OFFER_RELEASED'
    );
  }

  return updatedOffer;
}
