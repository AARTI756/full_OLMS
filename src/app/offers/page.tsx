'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shared/app-shell";
import type { OfferListItem, OfferSortBy, SortOrder } from "@/types/offer";
import { useOffers } from "@/hooks/use-offers";
import { useOfferFilterStore } from "@/store/use-offer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Activity, ArrowRight, CalendarDays, FileText, ShieldCheck, TrendingUp, UserCheck } from "lucide-react";

const statuses = ["", "DRAFT", "PENDING", "APPROVED", "REJECTED", "RELEASED", "ACCEPTED", "DECLINED"];
const departments = ["", "Engineering", "HR", "Sales", "Marketing", "Finance"];

const statusClasses: Record<string, string> = {
  DRAFT: "bg-slate-900 text-slate-200",
  PENDING: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
  RELEASED: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  ACCEPTED: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  DECLINED: "bg-slate-700 text-slate-100",
};

function OfferStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] ?? "bg-slate-900 text-slate-200"}`}>
      {status || "Unknown"}
    </span>
  );
}

export default function OffersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const {
    search,
    status,
    department,
    recruiter,
    page,
    sortBy,
    sortOrder,
    setSearch,
    setStatus,
    setDepartment,
    setRecruiter,
    setPage,
    setSortBy,
    setSortOrder,
  } = useOfferFilterStore();

  useEffect(() => {
    if (initialized) {
      return;
    }

    if (!searchParams) {
      setInitialized(true);
      return;
    }

    const query = searchParams.get('search') ?? '';
    const statusParam = searchParams.get('status') ?? '';
    const departmentParam = searchParams.get('department') ?? '';
    const recruiterParam = searchParams.get('recruiter') ?? '';
    const pageParam = Number(searchParams.get('page') ?? '1');
    const sortByParam = (searchParams.get('sortBy') as OfferSortBy) ?? 'offerDate';
    const sortOrderParam = (searchParams.get('sortOrder') as SortOrder) ?? 'desc';

    setSearch(query);
    setStatus(statusParam);
    setDepartment(departmentParam);
    setRecruiter(recruiterParam);
    setPage(pageParam);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);
    setInitialized(true);
  }, [initialized, searchParams, setSearch, setStatus, setDepartment, setRecruiter, setPage, setSortBy, setSortOrder]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (department) params.set('department', department);
    if (recruiter) params.set('recruiter', recruiter);
    if (page > 1) params.set('page', String(page));
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    router.replace(url);
  }, [initialized, search, status, department, recruiter, page, sortBy, sortOrder, router, pathname]);

  const { data, isLoading, isError } = useOffers({ search, status, department, recruiter, page, sortBy, sortOrder });
  const offerList = data?.data ?? [];
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total ?? 0) / 12)), [data]);

  const summary = useMemo(() => {
    const offers = offerList;
    const pending = offers.filter((offer) => offer.status === 'PENDING').length;
    const expiringSoon = offers.filter((offer) => {
      const diff = new Date(offer.validUntil).getTime() - Date.now();
      return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 7;
    }).length;
    const approved = offers.filter((offer) => offer.status === 'APPROVED').length;
    const released = offers.filter((offer) => offer.status === 'RELEASED').length;
    const accepted = offers.filter((offer) => offer.status === 'ACCEPTED').length;
    const departmentCounts = offers.reduce<Record<string, number>>((acc, offer) => {
      acc[offer.department] = (acc[offer.department] ?? 0) + 1;
      return acc;
    }, {});
    const topDepartment = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None';
    const approvalRate = offers.length ? Math.round((approved / offers.length) * 100) : 0;
    return { pending, expiringSoon, approved, released, accepted, topDepartment, approvalRate };
  }, [offerList]);

  const statusOrder: Record<string, number> = {
    DRAFT: 0,
    PENDING: 1,
    APPROVED: 2,
    RELEASED: 3,
    ACCEPTED: 4,
    REJECTED: 4,
    DECLINED: 4,
  };

  const timelineItems = useMemo(
    () => [...offerList]
      .sort((a, b) => new Date(b.offerDate).getTime() - new Date(a.offerDate).getTime())
      .slice(0, 4)
      .map((offer) => ({
        id: offer.id,
        label: `${offer.candidateName} • ${offer.status.toLowerCase()}`,
        date: new Date(offer.offerDate).toLocaleDateString(),
      })),
    [offerList]
  );

  function getExpiryTone(validUntil: string) {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 2) return 'bg-rose-500/15 text-rose-300 border border-rose-500/20';
    if (days <= 7) return 'bg-amber-500/15 text-amber-300 border border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
  }

  const recruiterOwner = recruiter ? recruiter : 'Talent operations';

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[32px] bg-slate-950/95 p-6 shadow-[0_30px_90px_rgba(8,15,32,0.35)] ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Offer planning</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Enterprise offer command center</h1>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Drive premium offer decisioning with intelligent workflow cards, approval progress, expiration alerts, and recruiter ownership visibility.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.push('/offers/new')}>Create offer</Button>
              <Button variant="secondary" onClick={() => setSearch('')}>Reset filters</Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Live offers</p>
              <p className="mt-4 text-4xl font-semibold text-white">{data?.total ?? 0}</p>
              <p className="mt-2 text-sm text-slate-500">Total offers in this workspace</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pending approvals</p>
              <p className="mt-4 text-4xl font-semibold text-white">{summary.pending}</p>
              <p className="mt-2 text-sm text-slate-500">Offers waiting on decision</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Top department</p>
              <p className="mt-4 text-4xl font-semibold text-white">{summary.topDepartment}</p>
              <p className="mt-2 text-sm text-slate-500">Most active hiring team</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Approval rate</p>
              <p className="mt-4 text-4xl font-semibold text-white">{summary.approvalRate}%</p>
              <p className="mt-2 text-sm text-slate-500">Offers approved across the current set</p>
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Workflow command</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Advanced offer filtering</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-4 py-2 text-sm text-slate-200">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  Team workflow snapshot
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <Input
                  placeholder="Search offers, candidates, roles..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="col-span-1 lg:col-span-3"
                />
                <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">All statuses</option>
                  {statuses.filter((item) => item).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
                <Select value={department} onChange={(event) => setDepartment(event.target.value)}>
                  <option value="">All departments</option>
                  {departments.filter((item) => item).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
                <Select value={recruiter} onChange={(event) => setRecruiter(event.target.value)}>
                  <option value="">All recruiters</option>
                  <option value="Avery">Avery</option>
                  <option value="Morgan">Morgan</option>
                  <option value="Jordan">Jordan</option>
                </Select>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-800/90 bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick status chips</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {statuses.slice(1).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${status === option ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-900/90 text-slate-300 hover:bg-slate-900'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Workflow summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Offer campaign pulse</h2>
                </div>
                <div className="rounded-full bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
                  Owned by {recruiterOwner}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Offer approvals</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{summary.approved}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Offers released</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{summary.released}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Offers accepted</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{summary.accepted}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Approval workflow progress</span>
                  <span className="font-semibold text-white">{summary.approvalRate}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${summary.approvalRate}%` }} />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Offer insights</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Analytic signals</h3>
                  </div>
                  <TrendingUp className="h-6 w-6 text-cyan-300" />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                    <div>
                      <p className="text-sm text-slate-400">Average offer value</p>
                      <p className="mt-2 text-lg font-semibold text-white">${offerList.length ? Math.round(offerList.reduce((sum, offer) => sum + offer.totalCtc, 0) / offerList.length).toLocaleString() : 0}</p>
                    </div>
                    <span className="rounded-full bg-slate-950/90 px-3 py-2 text-xs text-slate-300">CTC</span>
                  </div>
                  <div className="flex items-center justify-between rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                    <div>
                      <p className="text-sm text-slate-400">Expiring within 7 days</p>
                      <p className="mt-2 text-lg font-semibold text-white">{summary.expiringSoon}</p>
                    </div>
                    <CalendarDays className="h-5 w-5 text-amber-300" />
                  </div>
                  <div className="flex items-center justify-between rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                    <div>
                      <p className="text-sm text-slate-400">Offer campaign velocity</p>
                      <p className="mt-2 text-lg font-semibold text-white">{offerList.length ? `${Math.max(0, Math.round(offerList.length / 3))} / wk` : '0 / wk'}</p>
                    </div>
                    <UserCheck className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">PDF preview</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Offer document</h3>
                  </div>
                  <FileText className="h-6 w-6 text-cyan-300" />
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">Preview the latest offer document layout for selected candidates and ensure the executive summary is ready for review.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => router.push('/offers')} className="w-full">Preview PDF</Button>
                  <Button variant="secondary" className="w-full">Share summary</Button>
                </div>
              </motion.div>
            </div>
          </div>

          <aside className="space-y-6">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Offer health</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Approval timeline</h3>
                </div>
                <ShieldCheck className="h-6 w-6 text-cyan-300" />
              </div>

              <div className="mt-6 space-y-4">
                {timelineItems.length ? timelineItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                    <span className="mt-1 flex h-3 w-3 rounded-full bg-cyan-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5 text-sm text-slate-400">
                    No recent workflow activity yet. Apply filters or create a new offer to surface execution insights.
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.24 }} className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Awarded ownership</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Recruiter accountability</h3>
                </div>
                <UserCheck className="h-6 w-6 text-cyan-300" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Selected owner</p>
                  <p className="mt-2 font-semibold text-white">{recruiterOwner}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Offer handoff</p>
                  <p className="mt-2 font-semibold text-white">{recruiterOwner} — {summary.pending} live approvals</p>
                </div>
              </div>
            </motion.div>
          </aside>
        </section>

        <section className="rounded-[32px] bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Offer pipeline</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Premium offer cards</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>{offerList.length} offers</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>{data?.total ?? 0} total</span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-[28px] bg-slate-900/80" />
              ))
            ) : isError ? (
              <div className="rounded-[28px] border border-rose-500/10 bg-slate-900/80 p-8 text-center text-slate-400">
                Unable to load offers. Refresh or adjust filters to continue.
              </div>
            ) : offerList.length ? (
              <div className="grid gap-5">
                {offerList.map((offer) => {
                  const stage = statusOrder[offer.status] ?? 0;
                  const progress = Math.round((stage / 4) * 100);
                  const validDays = Math.max(0, Math.ceil((new Date(offer.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                  return (
                    <motion.button
                      key={offer.id}
                      type="button"
                      onClick={() => router.push(`/offers/${offer.id}`)}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-6 text-left shadow-[0_20px_80px_rgba(0,0,0,0.18)] transition duration-200 hover:border-cyan-500/30 hover:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                            <span className="inline-flex rounded-full bg-slate-950/80 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300">{offer.department}</span>
                            <OfferStatusBadge status={offer.status} />
                            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getExpiryTone(offer.validUntil)}`}>
                              {validDays <= 0 ? 'Expired' : `${validDays} days left`}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-white">{offer.title}</h3>
                            <p className="mt-2 text-sm text-slate-400">Candidate: {offer.candidateName}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                            <span>Owned by {recruiterOwner}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                            <span>v{offer.version}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-3 xl:items-end">
                          <div className="inline-flex items-center gap-3 rounded-full bg-slate-950/90 px-4 py-2 text-sm text-slate-200">
                            <ArrowRight className="h-4 w-4 text-cyan-300" />
                            <span>Offer value</span>
                          </div>
                          <p className="text-3xl font-semibold text-white">${offer.totalCtc.toLocaleString()}</p>
                          <p className="text-sm text-slate-400">Offer date • {new Date(offer.offerDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-3xl bg-slate-950/90 p-4">
                          <p className="text-sm text-slate-400">Base compensation</p>
                          <p className="mt-2 text-lg font-semibold text-white">${Math.round(offer.totalCtc * 0.65).toLocaleString()}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/90 p-4">
                          <p className="text-sm text-slate-400">Variable impact</p>
                          <p className="mt-2 text-lg font-semibold text-white">${Math.round(offer.totalCtc * 0.2).toLocaleString()}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/90 p-4">
                          <p className="text-sm text-slate-400">Signing bonus</p>
                          <p className="mt-2 text-lg font-semibold text-white">${Math.round(offer.totalCtc * 0.15).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4 rounded-[28px] border border-slate-800/90 bg-slate-950/90 p-4">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span>Approval workflow</span>
                          <span className="font-semibold text-white">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-5">
                          {['Draft', 'Pending', 'Approved', 'Released', 'Accepted'].map((step, index) => (
                            <span key={step} className={`flex items-center justify-center rounded-full px-2 py-1 ${index <= stage ? 'bg-cyan-500/10 text-cyan-200' : 'bg-slate-950/80 text-slate-500'}`}>
                              {step}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="rounded-3xl border border-slate-800/90 bg-slate-950/90 p-4 text-sm text-slate-400">
                          <p className="font-semibold text-white">Offer expiration</p>
                          <p className="mt-1">{validDays <= 0 ? 'Expired' : `${validDays} days remaining`}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button variant="secondary" className="rounded-3xl">View workflow</Button>
                          <Button className="rounded-3xl">Preview PDF</Button>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/80 p-10 text-center text-slate-400">
                <p className="text-lg font-semibold text-white">No offers found in this premium workspace.</p>
                <p className="mt-3">Try broadening filters, searching more broadly, or creating your first enterprise offer.</p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button onClick={() => router.push('/offers/new')}>Create offer</Button>
                  <Button variant="secondary" onClick={() => setStatus('')}>Show all statuses</Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Showing {offerList.length} of {data?.total ?? 0} offers</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>Previous</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
