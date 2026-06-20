'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Star, Sparkles } from 'lucide-react';
import { motionTiming } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { renderTemplateContent, DEFAULT_TEMPLATE_PREVIEW_CONTEXT } from '@/lib/template-variables';
import type { TemplateDetail } from '@/types/template';

interface TemplatePreviewModalProps {
  open: boolean;
  template?: TemplateDetail | null;
  onClose: () => void;
  onUse: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (templateId: string) => void;
}

export function TemplatePreviewModal({ open, template, onClose, onUse, onEdit, isFavorite, onToggleFavorite }: TemplatePreviewModalProps) {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (open) {
      setZoom(100);
    }
  }, [open]);

  const previewHtml = useMemo(
    () =>
      template
        ? renderTemplateContent(template.content ?? '', DEFAULT_TEMPLATE_PREVIEW_CONTEXT)
        : '<div class="flex h-full items-center justify-center p-8 text-sm text-slate-500">Loading template preview…</div>',
    [template]
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={motionTiming.soft}
        >
          <motion.div
            className="relative mx-auto w-full max-w-[1250px] overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/40"
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={motionTiming.page}
          >
            <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900/95 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Template preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{template?.title ?? 'Template preview'}</h2>
                <p className="text-sm text-slate-400">{template?.category ?? 'Loading…'} · {template?.description ?? ''}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="secondary" onClick={() => template && onToggleFavorite(template.id)}>
                  <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'text-amber-300' : 'text-slate-300'}`} />
                  {isFavorite ? 'Saved' : 'Favorite'}
                </Button>
                <Button type="button" variant="ghost" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.85fr] p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Live interpolation</p>
                    <p className="text-lg font-semibold text-white">Experience the template with sample candidate details.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
                    <Sparkles className="h-4 w-4" /> Preview mode
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-4 shadow-inner shadow-slate-950/20">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>Zoom</span>
                      <span className="font-semibold text-white">{zoom}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" onClick={() => setZoom((value) => Math.max(75, value - 25))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setZoom((value) => Math.min(150, value + 25))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative overflow-x-auto rounded-[28px] bg-white p-5 shadow-[0_35px_70px_rgba(15,23,42,0.16)]">
                    <div className="pointer-events-none absolute left-6 top-6 h-[calc(100%-2rem)] w-full rounded-[28px] bg-slate-950/10 shadow-[0_0_0_1px_rgba(15,23,42,0.06)]" />
                    <div className="pointer-events-none absolute left-10 top-10 h-[calc(100%-2.5rem)] w-full rounded-[28px] bg-slate-950/05 shadow-[0_0_0_1px_rgba(15,23,42,0.06)]" />
                    <div className="stacked-page relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_28px_60px_rgba(15,23,42,0.14)]" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                      <div className="absolute inset-x-6 top-6 h-2 rounded-full bg-slate-200/90" />
                      <div className="min-h-[840px] overflow-hidden rounded-[20px] bg-white p-6 text-slate-900 shadow-[0_16px_32px_rgba(15,23,42,0.08)]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Template details</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                      <span className="text-slate-300">Category</span>
                      <span>{template?.category ?? '–'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                      <span className="text-slate-300">Updated</span>
                      <span>{template ? new Date(template.updatedAt).toLocaleDateString() : '–'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Status</span>
                      <span className="text-slate-300">{template ? (template.isActive ? 'Live' : template.isArchived ? 'Archived' : 'Draft') : 'Loading…'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <Button type="button" className="w-full rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={() => template && onUse(template.id)}>
                    <ArrowLeft className="mr-2 h-4 w-4 rotate-180" /> Use this template
                  </Button>
                  <Button type="button" variant="secondary" className="w-full rounded-3xl" onClick={() => template && onEdit(template.id)}>
                    Edit template
                  </Button>
                  <Button type="button" variant="ghost" className="w-full rounded-3xl" onClick={onClose}>
                    Close preview
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
