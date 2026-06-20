'use client';

import { Button } from '@/components/ui/button';
import { Star, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="rounded-[32px] border border-slate-800/80 bg-slate-950/90 p-10 text-center shadow-2xl shadow-slate-950/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
        {icon ?? <Sparkles className="h-8 w-8" />}
      </div>
      <div className="mt-6 space-y-3">
        <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mx-auto max-w-xl text-sm leading-7 text-slate-400">{description}</p>
      </div>
      <div className="mt-8">
        <Button onClick={onAction} className="rounded-3xl bg-cyan-500 px-6 py-3 text-sm text-slate-950 hover:bg-cyan-400 shadow-[0_18px_50px_rgba(45,212,191,0.14)]">
          <span className="flex items-center justify-center gap-2">
            <Star className="h-4 w-4" />
            {actionLabel}
          </span>
        </Button>
      </div>
    </div>
  );
}
