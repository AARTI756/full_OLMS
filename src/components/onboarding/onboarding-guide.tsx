'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle2, FileText, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const onboardingTasks = [
  {
    id: 'add_candidate',
    title: 'Add your first candidate',
    description: 'Populate the pipeline to power every dashboard insight and move hiring forward.',
    route: '/candidates/new',
    icon: Users,
  },
  {
    id: 'create_offer',
    title: 'Create an offer',
    description: 'Turn talent interest into an executive-ready offer experience.',
    route: '/offers/new',
    icon: Briefcase,
  },
  {
    id: 'publish_template',
    title: 'Publish a template',
    description: 'Build consistency with polished offer letter designs that scale across roles.',
    route: '/templates/new',
    icon: FileText,
  },
  {
    id: 'review_approvals',
    title: 'Review approvals',
    description: 'Keep hiring momentum high by clearing pending approvals quickly.',
    route: '/approvals',
    icon: ShieldCheck,
  },
];

const storageKey = 'premiumOnboardingProgress';

export function OnboardingGuide() {
  const router = useRouter();
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setCompletedTaskIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCompletedTaskIds([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedTaskIds));
  }, [completedTaskIds]);

  const completedCount = completedTaskIds.length;
  const progress = useMemo(() => Math.round((completedCount / onboardingTasks.length) * 100), [completedCount]);

  const handleStartTask = (taskId: string, route: string) => {
    setCompletedTaskIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
    router.push(route);
  };

  const handleReset = () => {
    setCompletedTaskIds([]);
  };

  return (
    <div className="glass-card border-slate-800/80 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Guided launch</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Onboarding steps for your first placement</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            A curated onboarding path to help your team move from candidate sourcing to offer acceptance with confidence.
          </p>
        </div>
        <Button variant="secondary" className="rounded-3xl" onClick={handleReset}>
          Reset progress
        </Button>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <span>{completedCount} of {onboardingTasks.length} steps complete</span>
          <span>{progress}% complete</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {onboardingTasks.map((task) => {
          const Icon = task.icon;
          const completed = completedTaskIds.includes(task.id);

          return (
            <div key={task.id} className="rounded-[28px] border border-slate-800 bg-slate-900/85 p-5 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{completed ? 'Completed' : 'Action needed'}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{task.title}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${completed ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {completed ? 'Done' : 'New'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{task.description}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="secondary" className="rounded-3xl" onClick={() => handleStartTask(task.id, task.route)}>
                  {completed ? 'Review' : 'Start'}
                </Button>
                {completed && <span className="text-sm text-slate-400">You can revisit this step anytime.</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
