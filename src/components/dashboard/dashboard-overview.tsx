'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, FileText, Hourglass, Users } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { StatusChart } from '@/components/dashboard/status-chart';
import { HiringTrendChart } from '@/components/dashboard/hiring-trend-chart';
import { DepartmentBarChart } from '@/components/dashboard/department-bar-chart';
import { CompensationRadarChart } from '@/components/dashboard/compensation-radar-chart';
import { PipelineFunnel } from '@/components/dashboard/pipeline-funnel';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { InsightCard } from '@/components/dashboard/insight-card';
import { RecruiterSpotlight } from '@/components/dashboard/recruiter-spotlight';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { OnboardingGuide } from '@/components/onboarding/onboarding-guide';
import type { DashboardActivityItem, RecruiterPerformanceItem } from '@/types/dashboard';

const baseStats = [
  {
    label: 'Total offers',
    valueKey: 'totalOffers',
    delta: '+14% this month',
    description: 'A rising pipeline of active offers across teams.',
    icon: Briefcase,
    variant: 'default' as const,
    route: '/offers',
  },
  {
    label: 'Pending approvals',
    valueKey: 'pendingApprovals',
    delta: '+6 pending',
    description: 'Approvals waiting to unlock the next stage of hiring.',
    icon: Hourglass,
    variant: 'warning' as const,
    route: '/approvals',
  },
  {
    label: 'Accepted offers',
    valueKey: 'acceptedOffers',
    delta: '+18% this quarter',
    description: 'Offers that have converted into accepted roles.',
    icon: CheckCircle2,
    variant: 'success' as const,
    route: '/offers?status=ACCEPTED',
  },
  {
    label: 'Active candidates',
    valueKey: 'activeCandidates',
    delta: '+35 hiring',
    description: 'Candidates currently in workflow, moving toward offers.',
    icon: Users,
    variant: 'default' as const,
    route: '/candidates',
  },
];

export function DashboardOverview() {
  const router = useRouter();
  const { data, isLoading, isError } = useDashboard();
  const activityItems: DashboardActivityItem[] = data?.recentActivities ?? [];

  const hasData = Boolean(
    data &&
      (data.totalOffers || data.pendingApprovals || data.acceptedOffers || data.activeCandidates || data.statusDistribution.length)
  );

  const topRecruiter = data?.recruiterLeaderboard?.[0];
  const bestConversionRecruiter = data?.recruiterLeaderboard?.reduce<RecruiterPerformanceItem | null>((best, current) => {
    if (!best) return current;
    return current.candidateConversionRate > best.candidateConversionRate ? current : best;
  }, null);

  const topDepartment = data?.departmentAnalytics?.reduce((best, current) => {
    if (!best) return current;
    return current.accepted > best.accepted ? current : best;
  }, data?.departmentAnalytics?.[0]);

  const acceptanceRate = data?.totalOffers
    ? Math.round((data.acceptedOffers / Math.max(data.totalOffers, 1)) * 100)
    : 0;

  const hiringMomentum = (() => {
    const hiring = data?.monthlyHiring ?? [];
    if (hiring.length < 2) return '—';
    const previous = hiring[hiring.length - 2].hires;
    const current = hiring[hiring.length - 1].hires;
    const change = Math.round(((current - previous) / Math.max(previous, 1)) * 100);
    return `${change >= 0 ? '+' : ''}${change}%`;
  })();

  const spotlightMessage = topDepartment
    ? `${topDepartment.department} is leading the hiring pipeline with the strongest offer acceptance performance.`
    : 'Hiring performance is balancing across teams while the pipeline gains traction.';

  const groupedActivities = useMemo(() => {
    const grouped = new Map<string, DashboardActivityItem[]>();
    activityItems.forEach((item) => {
      const groupLabel = new Date(item.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const current = grouped.get(groupLabel) ?? [];
      current.push(item);
      grouped.set(groupLabel, current);
    });
    return Array.from(grouped.entries()).map(([date, items]) => ({ date, items }));
  }, [activityItems]);

  return (
    <motion.section initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <DashboardHero
        totalOffers={data?.totalOffers ?? 0}
        pendingApprovals={data?.pendingApprovals ?? 0}
        acceptedOffers={data?.acceptedOffers ?? 0}
        activeCandidates={data?.activeCandidates ?? 0}
        acceptanceRate={acceptanceRate}
        hiringMomentum={hiringMomentum}
        topRecruiter={topRecruiter}
        bestConversionRecruiter={bestConversionRecruiter ?? undefined}
        spotlightMessage={spotlightMessage}
      />

      <motion.div variants={fadeInUp} className="grid gap-5 xl:grid-cols-4">
        {baseStats.map((item) => {
          const value = isLoading ? '...' : isError ? '—' : String(data?.[item.valueKey as keyof typeof data] ?? 0);

          return (
            <StatCard
              key={item.label}
              label={item.label}
              value={value}
              delta={item.delta}
              description={item.description}
              icon={item.icon}
              variant={item.variant}
              onClick={() => {
                if (item.route) {
                  router.push(item.route);
                }
              }}
            />
          );
        })}
      </motion.div>

      {hasData && !isLoading && (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
          <HiringTrendChart monthlyHiring={data?.monthlyHiring ?? []} />
          <StatusChart
            statusDistribution={data?.statusDistribution ?? []}
            onSelectStatus={(status) => router.push(`/offers?status=${encodeURIComponent(status)}`)}
          />
        </div>
      )}

      {hasData && !isLoading && (
        <div className="grid gap-5 xl:grid-cols-2">
          <DepartmentBarChart
            departmentAnalytics={data?.departmentAnalytics ?? []}
            onSelectDepartment={(department) => router.push(`/candidates?department=${encodeURIComponent(department)}`)}
          />
          <CompensationRadarChart compensationAnalytics={data?.compensationAnalytics ?? { avgCtc: 0, highestCtc: 0, lowestCtc: 0, totalBudget: 0 }} />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <InsightCard
              title="Offer acceptance"
              metric={`${acceptanceRate}%`}
              badge="Healthy"
              accent="emerald"
              summary={
                data?.totalOffers
                  ? `Your current acceptance rate is ${acceptanceRate}%, signaling strong candidate resonance.`
                  : 'Awaiting first offers to measure acceptance performance.'
              }
            />
            <InsightCard
              title="Recruiter momentum"
              metric={topRecruiter ? `${topRecruiter.offersCreated} offers` : 'N/A'}
              badge="Lead"
              accent="cyan"
              summary={topRecruiter ? `${topRecruiter.recruiterName} is the most active recruiter this cycle.` : 'No recruiter activity detected yet.'}
            />
            <InsightCard
              title="Pipeline health"
              metric={hiringMomentum}
              badge="Momentum"
              accent="amber"
              summary={
                data?.statusDistribution?.length
                  ? 'The offer funnel is moving with the strongest phase currently in approval and acceptance.'
                  : 'Pipeline health will surface once offers and approvals flow through.'
              }
            />
          </div>

        </div>

        <RecruiterSpotlight topRecruiter={topRecruiter} bestConversionRecruiter={bestConversionRecruiter ?? undefined} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <PipelineFunnel
          totalOffers={data?.totalOffers ?? 0}
          acceptedOffers={data?.acceptedOffers ?? 0}
          pendingApprovals={data?.pendingApprovals ?? 0}
          activeCandidates={data?.activeCandidates ?? 0}
        />

        <div className="space-y-5">
          <QuickActions />
          <ActivityTimeline items={activityItems} isLoading={isLoading} />
        </div>
      </div>

      {!hasData && !isLoading && <OnboardingGuide />}
    </motion.section>
  );
}
