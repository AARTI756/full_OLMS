'use client';

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { fadeInUp, motionTiming } from "@/lib/motion";

interface AppShellProps {
  children: ReactNode;
  mainClassName?: string;
}

function canAccessPath(pathname: string, role: string | null) {
  if (!role) {
    return false;
  }

  if (pathname.startsWith("/settings")) {
    return role === "ADMIN";
  }

  if (pathname.startsWith("/approvals")) {
    return ["ADMIN", "HR", "FINANCE", "APPROVER"].includes(role);
  }

  return ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"].includes(role);
}

export function AppShell({ children, mainClassName }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/login");
    }
  }, [isHydrated, router, user]);

  useEffect(() => {
    if (isHydrated && user && !canAccessPath(pathname, user.role)) {
      router.replace("/");
    }
  }, [isHydrated, pathname, router, user]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950/90">
        <div className="mx-auto flex min-h-screen w-full max-w-[1720px] items-center justify-center px-4 py-6 xl:px-8">
          <div className="glass-card w-full max-w-2xl p-8 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Secure workspace</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Loading your session</h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Verifying your authentication state and restoring the HRMS dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!canAccessPath(pathname, user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950/90">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] gap-6 px-4 py-6 xl:px-8">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col gap-6 overflow-hidden rounded-[32px] border border-slate-800/75 bg-slate-950/95 shadow-[0_42px_120px_rgba(7,12,27,0.35)] backdrop-blur-xl ring-1 ring-slate-800/40">
          <TopNavbar />

          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              layout
              key={pathname}
              className={cn("space-y-6 px-4 py-4 sm:px-6 lg:px-8", mainClassName)}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeInUp}
              transition={motionTiming.page}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}