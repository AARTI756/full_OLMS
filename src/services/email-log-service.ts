import type { Prisma } from '@prisma/client';
import { prisma } from '@/prisma/client';

export type EmailLogStatus = 'SENT' | 'FAILED';

export async function recordEmailLog(data: {
  recipient: string;
  subject: string;
  status: EmailLogStatus;
  eventKey?: string | null;
  entityId?: string | null;
  details?: Record<string, unknown> | string | null;
}) {
  return prisma.emailLog.create({
    data: {
      recipient: data.recipient,
      subject: data.subject,
      status: data.status,
      eventKey: data.eventKey ?? null,
      entityId: data.entityId ?? null,
      details: data.details ? (data.details as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function hasEmailEventBeenSent(recipient: string, eventKey: string, entityId: string) {
  const existing = await prisma.emailLog.findFirst({
    where: {
      recipient,
      eventKey,
      entityId,
      status: 'SENT',
    },
  });

  return Boolean(existing);
}
