import { prisma } from '@/prisma/client';
import type { CandidateActivityType } from '@prisma/client';

export async function logCandidateActivity(candidateId: string, userId: string, action: CandidateActivityType, details: string) {
  return prisma.candidateActivity.create({
    data: {
      candidateId,
      userId,
      action,
      details,
    },
  });
}
