'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Briefcase, ChevronLeft, ChevronRight, FileText, LayoutDashboard, Settings, Sparkles, User2, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { hoverLift } from "@/lib/motion";

export const navItems = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard, roles: ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"] },
  { label: "Recruiters", href: routes.recruiters, icon: Users, roles: ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"] },
  { label: "Candidates", href: routes.candidates, icon: User2, roles: ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"] },
  { label: "Offers", href: routes.offers, icon: FileText, roles: ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"] },
  { label: "Templates", href: routes.templates, icon: Briefcase, roles: ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"] },
  { label: "Approvals", href: routes.approvals, icon: Activity, roles: ["ADMIN", "HR", "FINANCE", "APPROVER"] },
  { label: "Settings", href: routes.settings, icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role ?? null);
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = useMemo(
    () => navItems.filter((item) => !role || item.roles.includes(role)),
    [role]
  );

  return (
    <aside
      className={cn(
        "hidden xl:flex xl:flex-col xl:gap-6 xl:border-r xl:border-slate-800 xl:bg-slate-950/90 xl:px-4 xl:py-6 xl:backdrop-blur-xl xl:transition-all xl:duration-300",
        collapsed ? "xl:w-24" : "xl:w-[280px]"
      )}
    >
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 overflow-hidden rounded-[28px] border border-slate-800/90 bg-slate-900/85 px-4 py-4 text-slate-100 shadow-[0_24px_80px_rgba(7,12,27,0.26)] transition-all duration-300",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/10">
          <Sparkles className="h-5 w-5" />
        </div>
        {!collapsed ? (
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">OLMS</p>
            <h1 className="text-lg font-semibold text-white">Offer Manager</h1>
          </div>
        ) : null}
      </motion.div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1 overflow-hidden">
            {!collapsed ? (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">Workspace</p>
                <p className="text-sm font-semibold text-slate-200">Premium SaaS navigation</p>
              </>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800/80 bg-slate-900/80 text-slate-300 transition hover:border-cyan-300/40 hover:bg-slate-800/90"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-2">
          {visibleItems.map((item) => {
            const active = pathname === item.href;
            return (
              <motion.div key={item.href} layout whileHover={hoverLift.whileHover} transition={hoverLift.transition}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-3xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-cyan-500/10 text-cyan-200 shadow-[0_18px_40px_rgba(8,15,32,0.2)] ring-1 ring-cyan-400/15"
                      : "text-slate-300 hover:bg-slate-800/90 hover:text-cyan-300"
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl transition-all",
                      active ? "bg-cyan-500/15 text-cyan-300" : "bg-slate-900/80 text-slate-500 group-hover:bg-cyan-500/10 group-hover:text-cyan-300"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  {!collapsed ? (
                    <span className="relative z-10">{item.label}</span>
                  ) : null}
                  {active ? (
                    <span className="pointer-events-none absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full bg-cyan-400/80" />
                  ) : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-3xl border border-slate-800/90 bg-slate-900/85 p-4 text-slate-300 shadow-inner shadow-slate-950/20"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">Quick access</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Jump directly into hiring workflows, offers, and candidate decisions.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
  );
}
