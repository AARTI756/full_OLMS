'use server';

import { prisma } from '@/prisma/client';
import type { RecruiterPerformanceItem } from '@/types/dashboard';
import type {
  RecruiterSummaryItem,
  RecruiterDetail,
  RecruiterMonthlyPerformanceItem,
  RecruiterActivityItem,
} from '@/types/recruiter';

function formatMonth(date: Date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function buildActivityLabel(action: string, candidateName?: string | null, offerTitle?: string | null) {
  if (action.includes('APPROVAL')) {
    return offerTitle ? `Approval event for ${offerTitle}` : 'Approval workflow update';
  }

  if (action.includes('OFFER')) {
    return offerTitle ? `Offer event for ${offerTitle}` : 'Offer workflow update';
  }

  if (action.includes('CANDIDATE')) {
    return candidateName ? `Candidate event for ${candidateName}` : 'Candidate workflow update';
  }

  return 'Recruiter activity';
}

export async function getRecruiterPerformance(): Promise<RecruiterPerformanceItem[]> {
  const recruiters = await prisma.user.findMany({
    where: { role: { name: 'RECRUITER' }, isActive: true },
    select: {
      id: true,
      name: true,
      offersCreated: {
        select: {
          id: true,
          status: true,
          offerDate: true,
          createdAt: true,
        },
      },
      candidates: {
        select: {
          status: true,
        },
      },
    },
  });

  return recruiters
    .map((recruiter) => {
      const totalOffers = recruiter.offersCreated.length;
      const acceptedOffers = recruiter.offersCreated.filter((offer) => offer.status === 'ACCEPTED').length;
      const offersAccepted = acceptedOffers;
      const approvedOffers = recruiter.offersCreated.filter((offer) => offer.status === 'APPROVED' || offer.status === 'ACCEPTED').length;
      const hireCount = recruiter.candidates.filter((candidate) => candidate.status === 'HIRED').length;
      const turnaroundDays = recruiter.offersCreated
        .filter((offer) => offer.status === 'ACCEPTED')
        .map((offer) => Math.max(0, Math.round((offer.offerDate.getTime() - offer.createdAt.getTime()) / (1000 * 60 * 60 * 24))))
        .reduce((sum, value) => sum + value, 0);

      const avgTurnaroundDays = acceptedOffers ? Math.round(turnaroundDays / acceptedOffers) : 0;
      const approvalSuccessRate = totalOffers ? Math.round((approvedOffers / totalOffers) * 100) : 0;
      const acceptanceRate = totalOffers ? Math.round((offersAccepted / totalOffers) * 100) : 0;
      const conversionRate = recruiter.candidates.length ? Math.round((hireCount / recruiter.candidates.length) * 100) : 0;

      return {
        recruiterName: recruiter.name,
        offersCreated: totalOffers,
        offersAccepted,
        acceptanceRate,
        approvalSuccessRate,
        candidateConversionRate: conversionRate,
        avgTurnaroundDays,
        hireCount,
      };
    })
    .sort((a, b) => b.offersCreated - a.offersCreated)
    .slice(0, 6);
}

export async function getRecruiterList(): Promise<RecruiterSummaryItem[]> {
  const recruiters = await prisma.user.findMany({
    where: { role: { name: 'RECRUITER' }, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      department: { select: { name: true } },
      offersCreated: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          offerDate: true,
          validUntil: true,
        },
      },
      candidates: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  return recruiters.map((recruiter) => {
    const totalOffers = recruiter.offersCreated.length;
    const activeOffers = recruiter.offersCreated.filter((offer) => offer.status !== 'DRAFT' && offer.status !== 'DECLINED').length;
    const pendingApprovals = recruiter.offersCreated.filter((offer) => offer.status === 'PENDING').length;
    const expiringOffers = recruiter.offersCreated.filter((offer) => {
      if (offer.status !== 'PENDING') return false;
      const now = new Date();
      const diff = offer.validUntil.getTime() - now.getTime();
      return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3;
    }).length;
    const acceptedOffers = recruiter.offersCreated.filter((offer) => offer.status === 'ACCEPTED').length;
    const approvedOffers = recruiter.offersCreated.filter((offer) => offer.status === 'APPROVED' || offer.status === 'ACCEPTED').length;
    const hireCount = recruiter.candidates.filter((candidate) => candidate.status === 'HIRED').length;
    const stalledCandidates = recruiter.candidates.filter((candidate) => ['SCREENING', 'INTERVIEW'].includes(candidate.status)).length;
    const turnaroundDays = recruiter.offersCreated
      .filter((offer) => offer.status === 'ACCEPTED')
      .map((offer) => Math.max(0, Math.round((offer.offerDate.getTime() - offer.createdAt.getTime()) / (1000 * 60 * 60 * 24))))
      .reduce((sum, value) => sum + value, 0);

    return {
      id: recruiter.id,
      name: recruiter.name,
      email: recruiter.email,
      phone: recruiter.phone,
      department: recruiter.department?.name ?? 'Unassigned',
      totalOffers,
      activeOffers,
      pendingApprovals,
      expiringOffers,
      stalledCandidates,
      hireCount,
      acceptanceRate: totalOffers ? Math.round((acceptedOffers / totalOffers) * 100) : 0,
      approvalSuccessRate: totalOffers ? Math.round((approvedOffers / totalOffers) * 100) : 0,
      conversionRate: recruiter.candidates.length ? Math.round((hireCount / recruiter.candidates.length) * 100) : 0,
      avgTurnaroundDays: acceptedOffers ? Math.round(turnaroundDays / acceptedOffers) : 0,
    };
  });
}

export async function getRecruiterById(id: string): Promise<RecruiterDetail | null> {
  const recruiter = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      department: { select: { name: true } },
      candidates: {
        select: {
          id: true,
          fullName: true,
          status: true,
          role: true,
          department: { select: { name: true } },
          location: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      offersCreated: {
        select: {
          id: true,
          title: true,
          designation: true,
          status: true,
          totalCtc: true,
          offerDate: true,
          validUntil: true,
          createdAt: true,
          candidate: { select: { fullName: true } },
        },
        orderBy: { offerDate: 'desc' },
        take: 12,
      },
      activities: {
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
          candidate: { select: { fullName: true } },
          offer: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      },
    },
  });

  if (!recruiter) {
    return null;
  }

  const totalOffers = recruiter.offersCreated.length;
  const acceptedOffers = recruiter.offersCreated.filter((offer) => offer.status === 'ACCEPTED').length;
  const approvedOffers = recruiter.offersCreated.filter((offer) => offer.status === 'APPROVED' || offer.status === 'ACCEPTED').length;
  const pendingApprovals = recruiter.offersCreated.filter((offer) => offer.status === 'PENDING').length;
  const activeOffers = recruiter.offersCreated.filter((offer) => offer.status !== 'DRAFT' && offer.status !== 'DECLINED').length;
  const expiringOffers = recruiter.offersCreated.filter((offer) => {
    if (offer.status !== 'PENDING') return false;
    const now = new Date();
    const diff = offer.validUntil.getTime() - now.getTime();
    return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3;
  }).length;
  const hireCount = recruiter.candidates.filter((candidate) => candidate.status === 'HIRED').length;
  const stalledCandidates = recruiter.candidates.filter((candidate) => ['SCREENING', 'INTERVIEW'].includes(candidate.status)).length;
  const conversionRate = recruiter.candidates.length ? Math.round((hireCount / recruiter.candidates.length) * 100) : 0;
  const turnaroundDays = recruiter.offersCreated
    .filter((offer) => offer.status === 'ACCEPTED')
    .map((offer) => Math.max(0, Math.round((offer.offerDate.getTime() - offer.createdAt.getTime()) / (1000 * 60 * 60 * 24))))
    .reduce((sum, value) => sum + value, 0);
  const avgTurnaroundDays = acceptedOffers ? Math.round(turnaroundDays / acceptedOffers) : 0;

  const monthlyBuckets: Record<string, RecruiterMonthlyPerformanceItem> = {};
  const now = new Date();
  for (let offset = 5; offset >= 0; offset--) {
    const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthlyBuckets[formatMonth(month)] = { month: formatMonth(month), offersCreated: 0, offersAccepted: 0, hires: 0 };
  }

  recruiter.offersCreated.forEach((offer) => {
    const bucket = formatMonth(offer.offerDate);
    if (monthlyBuckets[bucket]) {
      monthlyBuckets[bucket].offersCreated += 1;
      if (offer.status === 'ACCEPTED') {
        monthlyBuckets[bucket].offersAccepted += 1;
      }
    }
  });

  recruiter.candidates.forEach((candidate) => {
    if (candidate.status === 'HIRED') {
      const bucket = formatMonth(candidate.createdAt);
      if (monthlyBuckets[bucket]) {
        monthlyBuckets[bucket].hires += 1;
      }
    }
  });

  const recentActivity: RecruiterActivityItem[] = recruiter.activities.map((activity) => ({
    id: activity.id,
    action: activity.action,
    details: activity.details,
    createdAt: activity.createdAt.toISOString(),
    label: buildActivityLabel(activity.action, activity.candidate?.fullName ?? null, activity.offer?.title ?? null),
    entityType: activity.offer ? 'offer' : activity.candidate ? 'candidate' : 'system',
  }));

  return {
    id: recruiter.id,
    name: recruiter.name,
    email: recruiter.email,
    phone: recruiter.phone,
    department: recruiter.department?.name ?? 'Unassigned',
    totalOffers,
    activeOffers,
    pendingApprovals,
    expiringOffers,
    stalledCandidates,
    hireCount,
    acceptanceRate: totalOffers ? Math.round((acceptedOffers / totalOffers) * 100) : 0,
    approvalSuccessRate: totalOffers ? Math.round((approvedOffers / totalOffers) * 100) : 0,
    conversionRate,
    avgTurnaroundDays,
    ownedCandidates: recruiter.candidates.map((candidate) => ({
      id: candidate.id,
      fullName: candidate.fullName,
      status: candidate.status,
      role: candidate.role,
      department: candidate.department.name,
      location: candidate.location,
      createdAt: candidate.createdAt.toISOString(),
    })),
    ownedOffers: recruiter.offersCreated.map((offer) => ({
      id: offer.id,
      title: offer.title,
      designation: offer.designation,
      status: offer.status,
      totalCtc: offer.totalCtc,
      candidateName: offer.candidate.fullName,
      offerDate: offer.offerDate.toISOString(),
      validUntil: offer.validUntil.toISOString(),
    })),
    recentActivity,
    monthlyPerformance: Object.values(monthlyBuckets),
  };
}
