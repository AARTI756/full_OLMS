'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Command } from 'lucide-react';
import { searchEntities } from '@/services/search-api';
import type { SearchResultItem } from '@/types/search';
import { cn } from '@/lib/utils';
import { motionTiming } from '@/lib/motion';

type QuickAction = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const quickActions: QuickAction[] = [
  { id: 'dashboard', title: 'Go to dashboard', subtitle: 'See hiring metrics, approvals, and activity trends.', href: '/dashboard' },
  { id: 'new-candidate', title: 'Create candidate profile', subtitle: 'Add a new candidate into the recruiting pipeline.', href: '/candidates/new' },
  { id: 'new-offer', title: 'Start a new offer', subtitle: 'Draft a fresh offer for your next hire.', href: '/offers/new' },
  { id: 'templates', title: 'Browse templates', subtitle: 'Open the offer template library and reuse polished content.', href: '/templates' },
  { id: 'approvals', title: 'Review approvals', subtitle: 'Manage pending approvals and expedite workflow decisions.', href: '/approvals' },
];

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem('olmsRecentSearches');
    if (stored) {
      try {
        setRecentQueries(JSON.parse(stored));
      } catch {
        setRecentQueries([]);
      }
    }
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const saveSearchTerm = (term: string) => {
    const normalized = term.trim();
    if (!normalized) {
      return;
    }

    const next = [normalized, ...recentQueries.filter((item) => item !== normalized)].slice(0, 5);
    setRecentQueries(next);
    window.localStorage.setItem('olmsRecentSearches', JSON.stringify(next));
  };

  const searchQuery = useQuery({
    queryKey: ['globalSearch', query],
    queryFn: () => searchEntities(query),
    enabled: open && query.length >= 2,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    searchQuery.data?.results.forEach((item) => {
      groups[item.group] = groups[item.group] ?? [];
      groups[item.group].push(item);
    });
    return groups;
  }, [searchQuery.data]);

  const flattenedResults = useMemo(() => {
    return searchQuery.data?.results ?? [];
  }, [searchQuery.data]);

  const visibleItems = query.length >= 2 ? flattenedResults : quickActions;

  useEffect(() => {
    if (!open) {
      return;
    }

    const listener = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [open]);

  const openSearch = () => setOpen(true);
  const closeSearch = () => setOpen(false);

  const selectResult = (item: SearchResultItem | QuickAction) => {
    if (query.length >= 2) {
      saveSearchTerm(query);
    }

    router.push(item.href);
    closeSearch();
    setQuery('');
    setActiveIndex(0);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!visibleItems.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, visibleItems.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      selectResult(visibleItems[activeIndex]);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openSearch}
        aria-expanded={open}
        aria-label="Open command palette"
        className="flex items-center gap-2 rounded-[24px] border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition duration-200 hover:border-cyan-300/30 hover:bg-slate-800/90 hover:text-white"
      >
        <Search className="h-4 w-4 text-cyan-300" />
        <span className="min-w-[10rem] text-left text-slate-300">Command palette</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
          <Command className="h-3 w-3" /> K
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTiming.soft}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeSearch}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={motionTiming.soft}
              role="dialog"
              aria-modal="true"
              className="fixed right-1/2 top-24 z-50 w-[min(100vw-1rem,560px)] max-w-[92vw] -translate-x-1/2 max-h-[80vh] overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-slate-950/40"
            >
              <div className="flex items-center gap-3 rounded-[24px] border border-slate-800/90 bg-slate-900/80 px-4 py-3">
                <Search className="h-4 w-4 text-cyan-300" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="Search candidates, offers, templates, or jump to commands..."
                />
                <button type="button" onClick={closeSearch} className="text-slate-400 transition hover:text-slate-200">
                  Esc
                </button>
              </div>

              <div className="mt-4 max-h-[calc(80vh-10rem)] overflow-y-auto pr-2">
                <div className="grid gap-4 lg:grid-cols-[0.6fr_0.4fr]">
                  <div className="space-y-4">
                    {query.length < 2 ? (
                      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-4">
                        <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] text-slate-500">
                          <span>Quick actions</span>
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Fast route</span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {quickActions.map((item, index) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectResult(item)}
                              className={cn(
                                'w-full rounded-3xl border px-4 py-4 text-left transition',
                                index === activeIndex
                                  ? 'border-cyan-400/40 bg-cyan-500/10 text-white'
                                  : 'border-slate-800 bg-slate-950/80 text-slate-200 hover:border-cyan-300/30 hover:bg-slate-900/90'
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold">{item.title}</p>
                                <ArrowRight className="h-4 w-4 text-cyan-300" />
                              </div>
                              <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-4">
                      <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] text-slate-500">
                        <span>Recent searches</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">History</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recentQueries.length ? (
                          recentQueries.map((label) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                setQuery(label);
                                setActiveIndex(0);
                              }}
                              className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-slate-900/90"
                            >
                              {label}
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">Search terms you use often will appear here for faster workflow routing.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-4">
                      <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] text-slate-500">
                        <span>{query.length >= 2 ? 'Search results' : 'Command overview'}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                          {query.length >= 2 ? searchQuery.data?.results.length ?? 0 : 'Ready'}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {query.length < 2 ? (
                          <div className="rounded-3xl border border-dashed border-slate-800/70 bg-slate-950/70 p-5 text-sm text-slate-400">
                            Start typing to surface recruiter commands, candidate profiles, offer plans, and premium workflows.
                          </div>
                        ) : searchQuery.isLoading ? (
                          [...Array(3)].map((_, index) => (
                            <div key={index} className="h-16 animate-pulse rounded-3xl bg-slate-900/80" />
                          ))
                        ) : searchQuery.data?.results.length ? (
                          Object.entries(groupedResults).map(([group, items]) => (
                            <div key={group} className="space-y-3">
                              <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                                <span>{group}</span>
                                <span>{items.length}</span>
                              </div>
                              <div className="space-y-2">
                                {items.map((item) => {
                                  const index = visibleItems.findIndex((result) => result.id === item.id);
                                  const selected = index === activeIndex;
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => selectResult(item)}
                                      className={cn(
                                        'w-full rounded-3xl border px-4 py-4 text-left transition',
                                        selected
                                          ? 'border-cyan-400/40 bg-cyan-500/10 text-white'
                                          : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-cyan-300/30 hover:bg-slate-900/90'
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold">
                                          {item.title.split(new RegExp(`(${query})`, 'gi')).map((segment, index) => (
                                            <span key={index} className={segment.toLowerCase() === query.toLowerCase() ? 'text-cyan-300' : ''}>
                                              {segment}
                                            </span>
                                          ))}
                                        </p>
                                        <ArrowRight className="h-4 w-4 text-cyan-300" />
                                      </div>
                                      <p className="mt-1 text-sm text-slate-400">
                                        {item.subtitle.split(new RegExp(`(${query})`, 'gi')).map((segment, index) => (
                                          <span key={index} className={segment.toLowerCase() === query.toLowerCase() ? 'text-cyan-300' : ''}>
                                            {segment}
                                          </span>
                                        ))}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-400">
                            No results found. Try broader recruiter workflow terms or quick commands to route the search.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
