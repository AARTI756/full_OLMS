import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "glass";
}

export function Card({ className, variant = "surface", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-800/75 bg-slate-950/92 shadow-2xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-300",
        variant === "glass" && "bg-slate-900/80 border-slate-700/60 shadow-[0_32px_90px_rgba(8,14,36,0.28)]",
        className
      )}
      {...props}
    />
  );
}
