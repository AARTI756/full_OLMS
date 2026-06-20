import { prisma } from '@/prisma/client';

export async function createActivity(data: {
  userId: string;
  action: string;
  details: string;
  candidateId?: string | null;
  offerId?: string | null;
}) {
  return prisma.activity.create({
    data: {
      userId: data.userId,
      action: data.action,
      details: data.details,
      candidateId: data.candidateId ?? undefined,
      offerId: data.offerId ?? undefined,
    },
  });
}
