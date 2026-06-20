'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/select';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-notifications';
import type { NotificationStatus, NotificationType } from '@prisma/client';
import { motionTiming, panelFade } from '@/lib/motion';

const notificationTypes: Array<{ value: NotificationType | ''; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'CANDIDATE', label: 'Candidate' },
  { value: 'APPROVAL', label: 'Approval' },
];

const notificationStatuses: Array<{ value: NotificationStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'READ', label: 'Read' },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | ''>('');
  const [page, setPage] = useState(1);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const notificationsQuery = useNotifications({ page, limit: 6, type: typeFilter || undefined, status: statusFilter || undefined });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const notifications = notificationsQuery.data?.data ?? [];

  const toggleOpen = () => setIsOpen((current) => !current);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getPriority = (type: NotificationType) => {
    if (type === 'APPROVAL') return 'Urgent';
    if (type === 'OFFER') return 'Action';
    if (type === 'CANDIDATE') return 'Update';
    return 'System';
  };

  const getSeverityLabel = (notification: typeof notifications[number]) => {
    const metadataEvent = (notification.metadata as { event?: string } | null | undefined)?.event;

    if (metadataEvent === 'OFFER_EXPIRING') return 'Expiry alert';
    if (metadataEvent === 'OFFER_APPROVAL_REQUESTED') return 'Approval needed';
    if (metadataEvent === 'OFFER_APPROVED') return 'Approval complete';
    if (metadataEvent === 'OFFER_REJECTED') return 'Approval declined';
    if (metadataEvent === 'CANDIDATE_ACCEPTED_OFFER') return 'Offer accepted';
    if (metadataEvent === 'RESUME_UPLOADED') return 'Resume added';
    if (metadataEvent === 'TEMPLATE_UPDATED') return 'Template published';
    return notification.type.toLowerCase();
  };

  const getActionHref = (notification: typeof notifications[number]) => {
    const metadataEvent = (notification.metadata as { event?: string } | null | undefined)?.event;

    if (metadataEvent === 'OFFER_APPROVAL_REQUESTED' || notification.type === 'APPROVAL') {
      return `/approvals`;
    }
    if (metadataEvent === 'OFFER_EXPIRING' || notification.type === 'OFFER') {
      return `/offers/${notification.entityId}`;
    }
    if (notification.type === 'CANDIDATE') {
      return `/candidates/${notification.entityId}`;
    }
    if (metadataEvent === 'TEMPLATE_UPDATED') {
      return `/templates/${notification.entityId}`;
    }
    if (notification.type === 'SYSTEM') {
      return '/settings';
    }
    return '/';
  };

  const groupedNotifications = useMemo(() => {
    return notifications.reduce((groups, notification) => {
      const key = notification.type || 'SYSTEM';
      if (!groups[key]) groups[key] = [];
      groups[key].push(notification);
      return groups;
    }, {} as Record<string, typeof notifications>);
  }, [notifications]);

  const categorySummary = useMemo(() => {
    return [
      { value: '', label: 'All', count: notifications.length },
      { value: 'APPROVAL', label: 'Approvals', count: groupedNotifications.APPROVAL?.length ?? 0 },
      { value: 'OFFER', label: 'Offers', count: groupedNotifications.OFFER?.length ?? 0 },
      { value: 'CANDIDATE', label: 'Candidates', count: groupedNotifications.CANDIDATE?.length ?? 0 },
      { value: 'SYSTEM', label: 'System', count: groupedNotifications.SYSTEM?.length ?? 0 },
    ];
  }, [groupedNotifications, notifications.length]);

  const isBusy = notificationsQuery.isFetching || markReadMutation.isPending || markAllMutation.isPending;

  const statusLabel = useMemo(() => {
    if (statusFilter === 'UNREAD') return 'Unread notifications';
    if (statusFilter === 'READ') return 'Read notifications';
    return 'All notifications';
  }, [statusFilter]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="relative rounded-3xl px-3 py-2 text-slate-300 hover:bg-slate-800/80"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        aria-label="Open notification inbox"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={panelRef}
            id="notification-panel"
            role="dialog"
            aria-modal="true"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={panelFade}
            transition={motionTiming.soft}
            className="absolute right-0 z-50 mt-3 w-[min(100vw-1rem,380px)] max-w-[380px] max-h-[80vh] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-slate-950/40"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">Notifications</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{statusLabel}</h3>
              </div>
              <Button variant="ghost" className="rounded-full p-2 text-slate-400 hover:bg-slate-800/80" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value as NotificationType | ''); setPage(1); }}>
                {notificationTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as NotificationStatus | ''); setPage(1); }}>
                {notificationStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">{unreadCount} unread</p>
              <Button
                type="button"
                variant="secondary"
                className="rounded-3xl text-sm"
                onClick={() => markAllMutation.mutate()}
                disabled={isBusy || unreadCount === 0}
              >
                Mark all read
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="flex flex-wrap gap-2">
                {categorySummary.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => {
                      setTypeFilter(category.value as NotificationType | '');
                      setPage(1);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${typeFilter === category.value ? 'border-cyan-400 bg-cyan-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-cyan-300/30 hover:bg-slate-900/90'}`}
                  >
                    {category.label} <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{category.count}</span>
                  </button>
                ))}
              </div>

              <div className="max-h-[52vh] overflow-y-auto pr-1">
                {notificationsQuery.isLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-900/80" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <EmptyState
                    title="No notifications found"
                    description="Your filtered inbox is empty. Clear filters to surface recruiter alerts, approval queues, and workflow insights instantly."
                    actionLabel="Show all notifications"
                    onAction={() => {
                      setTypeFilter('');
                      setStatusFilter('');
                      setPage(1);
                    }}
                  />
                ) : (
                  notifications.map((notification) => (
                    <motion.button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        markReadMutation.mutate(notification.id);
                        router.push(getActionHref(notification));
                      }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.18, ease: [0.35, 0.7, 0.3, 1] }}
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-900/90"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{notification.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                        </div>
                        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${notification.status === 'UNREAD' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
                          {notification.status === 'UNREAD' ? <Circle className="h-3 w-3 text-rose-400" /> : <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          {notification.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                          {getSeverityLabel(notification)}
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                          {getPriority(notification.type)}
                        </span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>{notifications.length} of {notificationsQuery.data?.total ?? 0}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-3xl px-3 py-2 text-xs"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-3xl px-3 py-2 text-xs"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={notifications.length === 0 || notifications.length < 6}
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
