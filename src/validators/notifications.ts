import { z } from "zod";
import { NotificationStatus, NotificationType } from "@prisma/client";

export const notificationListSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  type: z.nativeEnum(NotificationType).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
});
