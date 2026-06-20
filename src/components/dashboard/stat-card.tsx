import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp, hoverGrow } from '@/lib/motion';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning';
  onClick?: () => void;
}

function formatCounter(value: string) {
  const cleanNumber = Number(value.replace(/[^0-9.-]/g, ''));
  const suffix = value.replace(/^-?[0-9,.]+/, '');
  return { number: cleanNumber, suffix };
}

export function StatCard({ label, value, delta, description, icon: Icon, variant = 'default', onClick }: StatCardProps) {
  const { number, suffix } = useMemo(() => formatCounter(value), [value]);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (Number.isNaN(number)) {
      setDisplayValue(value);
      return;
    }

    let frame: number;
    const duration = 500;
    const start = performance.now();
    const initial = 0;

    const animate = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - start) / duration);
      const current = Math.round(initial + (number - initial) * progress);
      setDisplayValue(`${current}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [number, suffix, value]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={fadeInUp}
      whileHover={hoverGrow.whileHover}
      transition={hoverGrow.transition}
      className={cn(
        'glass-card p-6 text-left transition-all duration-200',
        onClick && 'cursor-pointer hover:border-cyan-300/20 hover:bg-slate-900/90',
        variant === 'success' && 'border border-emerald-500/10',
        variant === 'warning' && 'border border-amber-500/10'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">{displayValue}</p>
          {description ? <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        <div className="rounded-3xl bg-slate-900/80 p-3 text-cyan-300 shadow-inner shadow-slate-950/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.26em] text-cyan-300">{delta}</span>
      </div>
    </motion.button>
  );
}
