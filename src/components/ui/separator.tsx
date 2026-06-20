'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal" ? "h-px w-full bg-slate-800/90" : "w-px h-full bg-slate-800/90",
        className
      )}
      role="separator"
      {...props}
    />
  );
}
