import type { NotificationStatus, NotificationType, Prisma } from "@prisma/client";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  entityId?: string | null;
  metadata?: Prisma.JsonValue | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface NotificationListFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  status?: NotificationStatus;
}

export interface NotificationUpdateInput {
  status: NotificationStatus;
}

export type NotificationCreateInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};
