import { prisma } from '@/prisma/client';
import { getSettings } from '@/services/settings-service';
import { createExpiringOfferNotifications, notifyOfferExpiring } from '@/services/notification-service';
import { hasEmailEventBeenSent } from '@/services/email-log-service';
import { sendOfferExpiringEmail, sendReminderEmail, sendApprovalRequestEmail } from '@/services/email-service';
import { NotificationType } from '@prisma/client';

function getSiteUrl() {
  return process.env.SITE_URL || 'http://localhost:3000';
}

function buildOfferUrl(offerId: string) {
  return `${getSiteUrl()}/offers/${offerId}`;
}

function buildCandidateUrl(candidateId: string) {
  return `${getSiteUrl()}/candidates/${candidateId}`;
}

export async function runExpiringOfferAutomation() {
  const settings = await getSettings();
  if (!settings.automationEmailReminders) {
    return;
  }

  await createExpiringOfferNotifications();

  const now = new Date();
  const threshold = new Date(now.getTime() + settings.automationExpiryThresholdDays * 24 * 60 * 60 * 1000);

  const expiringOffers = await prisma.offer.findMany({
    where: {
      status: 'PENDING',
      validUntil: { gte: now, lte: threshold },
    },
    include: {
      creator: { select: { id: true, email: true, name: true } },
      candidate: { select: { fullName: true } },
      department: { select: { name: true } },
    },
  });

  await Promise.all(
    expiringOffers.map(async (offer) => {
      if (!offer.creator?.email || !offer.creator.name) {
        return;
      }

      if (!(await hasEmailEventBeenSent(offer.creator.email, 'OFFER_EXPIRING', offer.id))) {
        await sendOfferExpiringEmail(
          {
            id: offer.id,
            title: offer.title,
            candidateName: offer.candidate.fullName,
            candidateEmail: '',
            candidatePhone: '',
            departmentName: offer.department?.name ?? 'Recruiting',
            designation: offer.title,
            status: offer.status,
            baseSalary: 0,
            variablePay: 0,
            joiningBonus: 0,
            retentionBonus: 0,
            probationPeriodMonths: 0,
            offerDate: offer.validUntil.toISOString(),
            validUntil: offer.validUntil.toISOString(),
            totalCtc: 0,
            version: 1,
            approvalComments: null,
            candidateId: '',
            templateId: null,
            templateTitle: null,
            createdById: offer.creator.id,
            approvals: [],
          } as any,
          offer.creator.name,
          offer.creator.email,
          buildOfferUrl(offer.id)
        );
      }

      await notifyOfferExpiring(offer.creator.id, offer.id, offer.title);
    })
  );
}

export async function runOverdueApprovalsAutomation() {
  const settings = await getSettings();
  if (!settings.automationEmailReminders) {
    return;
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - settings.automationApprovalReminderHours * 60 * 60 * 1000);

  const approvals = await prisma.approval.findMany({
    where: {
      decision: 'PENDING',
      offer: {
        status: 'PENDING',
        validUntil: { gt: now },
      },
      updatedAt: { lte: cutoff },
    },
    include: {
      approver: { select: { email: true, name: true, id: true } },
      offer: {
        select: {
          id: true,
          title: true,
          candidate: { select: { fullName: true } },
          department: { select: { name: true } },
        },
      },
    },
  });

  await Promise.all(
    approvals.map(async (approval) => {
      if (!approval.approver.email || !approval.approver.name) {
        return;
      }

      const message = `Approval for offer ${approval.offer.title} has been pending for more than ${settings.automationApprovalReminderHours} hours. Please review the request to keep the workflow on schedule.`;
      await sendReminderEmail(
        'Pending approval reminder',
        message,
        approval.offer.department?.name ?? 'OLMS',
        approval.approver.name,
        approval.approver.email,
        buildOfferUrl(approval.offer.id),
        approval.offer.id
      );
    })
  );
}

export async function runStaleCandidatesAutomation() {
  const settings = await getSettings();
  if (!settings.automationEmailReminders) {
    return;
  }

  const staleCutoff = new Date(Date.now() - settings.automationStaleCandidateDays * 24 * 60 * 60 * 1000);

  const candidates = await prisma.candidate.findMany({
    where: {
      status: { in: ['SCREENING', 'INTERVIEW'] },
      updatedAt: { lte: staleCutoff },
      recruiter: { isNot: null },
    },
    include: {
      recruiter: { select: { id: true, email: true, name: true } },
      department: { select: { name: true } },
    },
  });

  await Promise.all(
    candidates.map(async (candidate) => {
      if (!candidate.recruiter?.email || !candidate.recruiter.name) {
        return;
      }

      const message = `Candidate ${candidate.fullName} has not progressed for ${settings.automationStaleCandidateDays} days. Follow up with your candidate and move the hiring workflow forward.`;
      await sendReminderEmail(
        'Stale candidate follow-up',
        message,
        candidate.department?.name ?? 'Recruiting',
        candidate.recruiter.name,
        candidate.recruiter.email,
        buildCandidateUrl(candidate.id),
        candidate.id
      );
    })
  );
}

export async function runRecruiterReminderAutomation() {
  const settings = await getSettings();
  if (!settings.automationEmailReminders) {
    return;
  }

  const recruiters = await prisma.user.findMany({
    where: { role: { name: 'RECRUITER' }, isActive: true },
    include: {
      candidates: {
        where: { status: { in: ['SCREENING', 'INTERVIEW'] } },
      },
      offersCreated: {
        where: { status: 'PENDING' },
      },
    },
  });

  await Promise.all(
    recruiters.map(async (recruiter) => {
      if (!recruiter.email || !recruiter.name) {
        return;
      }

      const pendingCount = recruiter.offersCreated.length;
      const activeCandidates = recruiter.candidates.length;

      if (pendingCount === 0 && activeCandidates === 0) {
        return;
      }

      const message = `You have ${pendingCount} pending offers and ${activeCandidates} active candidate pipelines that may require follow-up today.`;
      await sendReminderEmail(
        'Recruiter workflow reminder',
        message,
        'OLMS',
        recruiter.name,
        recruiter.email,
        getSiteUrl(),
        recruiter.id
      );
    })
  );
}

export async function runCleanupAutomation() {
  const settings = await getSettings();
  const cutoff = new Date(new Date().getTime() - settings.automationCleanupDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff }, status: 'READ' },
    }),
    prisma.emailLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);
}
