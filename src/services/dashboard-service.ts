import { prisma } from "@/prisma/client";
import { getRecruiterPerformance } from "@/services/recruiter-service";
import { createExpiringOfferNotifications } from '@/services/notification-service';
import type { DashboardStats } from "@/types/dashboard";

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await createExpiringOfferNotifications();
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [totalOffers, pendingApprovals, acceptedOffers, activeCandidates, statusCounts, recentActivities, pipelineCounts, offersSince] = await prisma.$transaction([
    prisma.offer.count(),
    prisma.approval.count({ where: { decision: "PENDING" } }),
    prisma.offer.count({ where: { status: "ACCEPTED" } }),
    prisma.candidate.count(),
    prisma.offer.groupBy({
      by: ["status"],
      orderBy: { status: "asc" },
      _count: { status: true },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        offer: { select: { title: true } },
        candidate: { select: { fullName: true } },
      },
    }),
    prisma.candidate.groupBy({
      by: ["status"],
      orderBy: { status: "asc" },
      _count: { status: true },
    }),
    prisma.offer.findMany({
      where: { offerDate: { gte: sixMonthsAgo } },
      select: { offerDate: true },
      orderBy: { offerDate: "asc" },
    }),
  ]);

  const [allDepartments, recruiterLeaderboard] = await Promise.all([
    prisma.department.findMany({
      include: {
        offers: {
          select: { status: true, totalCtc: true },
        },
      },
    }),
    getRecruiterPerformance(),
  ]);

  const statusOrder = ["APPROVED", "PENDING", "REJECTED", "RELEASED", "ACCEPTED", "DRAFT", "DECLINED"];
  const statusDistribution = statusOrder.map((status) => {
    const countItem = statusCounts.find((item) => item.status === status);
    return {
      name: status,
      value: countItem ? (countItem._count as { status: number }).status : 0,
    };
  });

  const candidatePipeline = pipelineCounts.map((group) => ({
    stage: group.status,
    count: (group._count as { status: number }).status,
  }));

  const months = Array.from({ length: 6 }).map((_, index) => {
    const month = new Date(sixMonthsAgo);
    month.setMonth(sixMonthsAgo.getMonth() + index);
    return formatMonth(month);
  });

  const monthlyCounts = months.reduce<Record<string, number>>((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {});

  offersSince.forEach((offer) => {
    const month = formatMonth(new Date(offer.offerDate));
    if (month in monthlyCounts) {
      monthlyCounts[month] += 1;
    }
  });

  const monthlyHiring = Object.entries(monthlyCounts).map(([month, hires]) => ({ month, hires }));

  const departmentAnalytics = allDepartments.map((department) => {
    const offers = department.offers ?? [];
    const accepted = offers.filter((offer) => offer.status === "ACCEPTED").length;
    const totalCtc = offers.reduce((sum, offer) => sum + (offer.totalCtc ?? 0), 0);
    return {
      department: department.name,
      offers: offers.length,
      accepted,
      avgCtc: offers.length ? Math.round(totalCtc / offers.length) : 0,
    };
  });

  const compensation = await prisma.offer.aggregate({
    _avg: { totalCtc: true },
    _max: { totalCtc: true },
    _min: { totalCtc: true },
    _sum: { totalCtc: true },
  });

  return {
    totalOffers,
    pendingApprovals,
    acceptedOffers,
    activeCandidates,
    statusDistribution,
    recentActivities: recentActivities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      title: activity.action.replaceAll("_", " "),
      subtitle:
        activity.details ??
        [
          activity.offer?.title ? `Offer: ${activity.offer.title}` : null,
          activity.candidate?.fullName ? `Candidate: ${activity.candidate.fullName}` : null,
          `By ${activity.user.name}`,
        ]
          .filter(Boolean)
          .join(" • "),
      createdAt: activity.createdAt.toISOString(),
    })),
    candidatePipeline,
    monthlyHiring,
    departmentAnalytics,
    compensationAnalytics: {
      avgCtc: Math.round(compensation._avg.totalCtc ?? 0),
      highestCtc: compensation._max.totalCtc ?? 0,
      lowestCtc: compensation._min.totalCtc ?? 0,
      totalBudget: Math.round(compensation._sum.totalCtc ?? 0),
    },
    recruiterLeaderboard,
  };
}
