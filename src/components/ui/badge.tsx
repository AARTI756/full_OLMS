'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-900/95 text-slate-100 border border-slate-700/80",
    success: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
    info: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
    brand: "bg-cyan-500/10 text-cyan-200 border border-cyan-400/20",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.22em] uppercase", variantStyles[variant], className)} {...props} />
  );
}
