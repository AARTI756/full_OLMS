'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[24px] px-5 py-3 text-sm font-semibold transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        variant === "primary" && "bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_22px_64px_rgba(45,212,191,0.24)] hover:shadow-[0_28px_95px_rgba(45,212,191,0.28)] active:-translate-y-px active:shadow-[0_18px_45px_rgba(45,212,191,0.16)]",
        variant === "secondary" && "bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-[0_10px_30px_rgba(5,9,24,0.14)] hover:bg-slate-800/90 active:-translate-y-px active:shadow-[0_8px_24px_rgba(5,9,24,0.12)]",
        variant === "ghost" && "bg-slate-950/70 text-slate-200 hover:bg-slate-900/85 active:-translate-y-px",
        variant === "outline" && "border border-slate-700 text-slate-100 hover:bg-slate-900/80 active:-translate-y-px",
        className
      )}
      {...props}
    />
  );
}
