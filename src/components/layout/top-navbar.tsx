'use client';

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, UserCircle2, Menu, X, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { GlobalSearch } from "@/components/layout/global-search";
import { clearAccessToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { navItems } from "@/components/layout/sidebar";
import { motionTiming } from "@/lib/motion";

export function TopNavbar() {
  const { user, clearUser } = useAuthStore();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !user?.role || item.roles.includes(user.role)),
    [user?.role]
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAccessToken();
    clearUser();
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-4 z-30 rounded-[32px] border border-slate-800/70 bg-slate-950/95 p-5 shadow-[0_40px_90px_rgba(7,12,27,0.35)] backdrop-blur-xl transition-all duration-300">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
          <div className="hidden xl:block">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Welcome back</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Executive command workspace</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 px-3 py-2 text-slate-300 shadow-inner shadow-slate-950/10">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span className="text-sm text-slate-200">Premium recruiting operations</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="hidden rounded-3xl px-4 py-2 text-slate-300 hover:bg-slate-800/80 xl:inline-flex"
            onClick={() => router.push('/candidates/new')}
          >
            <Plus className="h-4 w-4" />
            <span>New candidate</span>
          </Button>
          <Button
            variant="ghost"
            className="hidden rounded-3xl px-4 py-2 text-slate-300 hover:bg-slate-800/80 xl:inline-flex"
            onClick={() => router.push('/offers/new')}
          >
            <Plus className="h-4 w-4" />
            <span>New offer</span>
          </Button>
          <GlobalSearch />
          <NotificationDropdown />
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 px-4 py-2 text-slate-200 transition hover:border-cyan-300/40 hover:bg-slate-800/90"
            >
              <UserCircle2 className="h-5 w-5 text-cyan-300" />
              <div className="hidden text-left xl:block">
                <p className="text-sm font-medium text-white">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-slate-500">{user?.role ?? "Team member"}</p>
              </div>
            </button>

            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={motionTiming.soft}
                  className="absolute right-0 top-full z-40 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950/95 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
                >
                  <div className="space-y-3">
                    <div className="rounded-3xl bg-slate-900/85 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">Profile</p>
                      <p className="mt-2 text-sm font-semibold text-white">{user?.name ?? "Guest"}</p>
                      <p className="text-sm text-slate-400">{user?.email ?? "No email"}</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          router.push('/settings');
                          setProfileOpen(false);
                        }}
                        className="w-full rounded-3xl bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800/90"
                      >
                        Account settings
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-3xl bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" className="rounded-3xl px-3 py-2 text-slate-300 hover:bg-slate-800/80 xl:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm" />
              <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-[82vw] max-w-sm flex-col border-l border-slate-800 bg-slate-950/95 p-5 shadow-2xl shadow-black/60 outline-none backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">OLMS</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">Navigation</h3>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" className="rounded-3xl px-3 py-2 text-slate-300 hover:bg-slate-800/80">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {visibleNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/90 hover:text-cyan-300"
                    >
                      <item.icon className="h-4 w-4 text-cyan-300/70" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
