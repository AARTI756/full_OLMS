import { prisma } from "@/prisma/client";
import type { NotificationCreateInput, NotificationListFilters, NotificationListResponse } from "@/types/notification";
import { NotificationStatus, NotificationType, Prisma } from "@prisma/client";

export async function getNotifications(userId: string, filters: NotificationListFilters = {}): Promise<NotificationListResponse> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 50) : 12;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const [total, unreadCount, notifications] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, status: NotificationStatus.UNREAD } }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    total,
    unreadCount,
    data: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status,
      entityId: notification.entityId,
      metadata: notification.metadata as Prisma.JsonValue | null,
      createdAt: notification.createdAt.toISOString(),
    })),
  };
}

export async function createNotification(input: NotificationCreateInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      status: NotificationStatus.UNREAD,
      entityId: input.entityId,
      metadata: input.metadata ?? undefined,
    },
  });

  await prisma.notificationAudit.create({
    data: {
      notificationId: notification.id,
      action: "NOTIFICATION_CREATED",
      details: input.metadata ?? { title: input.title, message: input.message },
      performedById: input.userId,
    },
  });

  return notification;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found.");
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { status: NotificationStatus.READ },
  });

  await prisma.notificationAudit.create({
    data: {
      notificationId: updated.id,
      action: "NOTIFICATION_MARKED_READ",
      details: { previousStatus: notification.status, userId },
      performedById: userId,
    },
  });

  return updated;
}

export async function markAllNotificationsRead(userId: string) {
  const updated = await prisma.notification.updateMany({
    where: { userId, status: NotificationStatus.UNREAD },
    data: { status: NotificationStatus.READ },
  });

  await prisma.notificationAudit.create({
    data: {
      notificationId: null,
      action: "NOTIFICATIONS_MARK_ALL_READ",
      details: { count: updated.count },
      performedById: userId,
    },
  });

  return updated.count;
}

export async function notifyOfferCreated(userId: string, offerId: string, offerTitle: string) {
  return createNotification({
    userId,
    type: NotificationType.OFFER,
    title: "Offer created",
    message: `Your offer ‘${offerTitle}’ was created successfully.`,
    entityId: offerId,
    metadata: { event: "OFFER_CREATED" },
  });
}

export async function notifyOfferStatusChange(userId: string, offerId: string, offerTitle: string, status: NotificationType, message: string, event: string) {
  return createNotification({
    userId,
    type: NotificationType.APPROVAL,
    title: status,
    message,
    entityId: offerId,
    metadata: { event },
  });
}

export async function notifyCandidateCreated(userId: string, candidateId: string, candidateName: string) {
  return createNotification({
    userId,
    type: NotificationType.CANDIDATE,
    title: 'Candidate added',
    message: `A new candidate profile has been created for ${candidateName}.`,
    entityId: candidateId,
    metadata: { event: 'CANDIDATE_CREATED' },
  });
}

export async function notifyApprovalRequested(userId: string, offerId: string, offerTitle: string) {
  return createNotification({
    userId,
    type: NotificationType.APPROVAL,
    title: 'Approval requested',
    message: `Please review the offer ${offerTitle}.`,
    entityId: offerId,
    metadata: { event: 'OFFER_APPROVAL_REQUESTED' },
  });
}

export async function notifyResumeUploaded(userId: string, candidateId: string, candidateName: string, fileName: string) {
  return createNotification({
    userId,
    type: NotificationType.CANDIDATE,
    title: 'Resume uploaded',
    message: `A new resume (${fileName}) was uploaded for ${candidateName}.`,
    entityId: candidateId,
    metadata: { event: 'RESUME_UPLOADED' },
  });
}

export async function notifyTemplateUpdated(userId: string, templateId: string, templateTitle: string) {
  return createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: 'Template updated',
    message: `Template ${templateTitle} was updated and versioned.`,
    entityId: templateId,
    metadata: { event: 'TEMPLATE_UPDATED' },
  });
}

export async function notifySettingsUpdated(userId: string) {
  return createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title: "Settings updated",
    message: "System configuration was updated successfully.",
    metadata: { event: "SETTINGS_UPDATED" },
  });
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function notifyOfferExpiring(userId: string, offerId: string, offerTitle: string) {
  return createNotification({
    userId,
    type: NotificationType.OFFER,
    title: 'Offer expiring soon',
    message: `Offer '${offerTitle}' is due to expire within 72 hours.`,
    entityId: offerId,
    metadata: { event: 'OFFER_EXPIRING' },
  });
}

export async function createExpiringOfferNotifications() {
  const now = new Date();
  const soon = addDays(now, 3);

  const expiringOffers = await prisma.offer.findMany({
    where: {
      status: 'PENDING',
      validUntil: { gte: now, lte: soon },
    },
    include: {
      creator: { select: { id: true } },
    },
  });

  await Promise.all(
    expiringOffers.map(async (offer) => {
      if (!offer.creator?.id) {
        return;
      }

      const existing = await prisma.notification.findFirst({
        where: {
          userId: offer.creator.id,
          entityId: offer.id,
          metadata: { path: ['event'], equals: 'OFFER_EXPIRING' },
        },
      });

      if (!existing) {
        await notifyOfferExpiring(offer.creator.id, offer.id, offer.title);
      }
    })
  );
}
