'use client';

import { motion } from 'framer-motion';
import { Eye, Pencil, Copy, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OfferTemplateItem } from '@/types/template';
import { fadeInUp } from '@/lib/motion';

interface TemplateCardProps {
  template: OfferTemplateItem;
  isFavorite: boolean;
  onOpenPreview: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDuplicate: (templateId: string) => void;
  onToggleFavorite: (templateId: string) => void;
}

const previewCanvas = (category: string) => (
  <div className="space-y-3">
    <div className="h-3 w-24 rounded-full bg-slate-200" />
    <div className="h-2 w-32 rounded-full bg-slate-200" />
    <div className="h-2 w-20 rounded-full bg-slate-200" />
    <div className="mt-4 rounded-[20px] border border-slate-200/70 bg-slate-100/90 p-3">
      <div className="h-3 w-20 rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-28 rounded-full bg-slate-200" />
    </div>
    <div className="mt-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded-full bg-slate-200" />
        <div className="h-2 w-20 rounded-full bg-slate-200" />
      </div>
    </div>
  </div>
);

export function TemplateCard({ template, isFavorite, onOpenPreview, onEdit, onDuplicate, onToggleFavorite }: TemplateCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -10, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="masonry-item group relative overflow-hidden rounded-[34px] border border-slate-800 bg-slate-950/95 shadow-[0_28px_80px_rgba(6,10,28,0.24)] transition duration-300 hover:border-cyan-500/40 hover:shadow-[0_40px_120px_rgba(6,10,28,0.35)]"
    >
      <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-300">{template.category}</span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
            onClick={() => onToggleFavorite(template.id)}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'text-amber-300' : 'text-slate-300'}`} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">{template.title}</h3>
          <p className="text-sm leading-6 text-slate-400 line-clamp-3">{template.description ?? 'A premium offer letter format with enterprise-ready layout.'}</p>
        </div>

        <div className="mt-7 relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/95 p-5 shadow-inner shadow-slate-950/10">
          <div className="absolute -left-4 top-8 h-[calc(100%-2rem)] w-full rounded-[28px] border border-slate-800/50 bg-slate-950/40 blur-xl" />
          <div className="absolute -right-4 top-12 h-[calc(100%-2.5rem)] w-full rounded-[28px] border border-slate-800/50 bg-slate-950/40 blur-xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-slate-800/70 bg-slate-950/90 p-5">
            <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-slate-300 shadow-lg shadow-slate-950/40">
              <span className="h-2 w-2 rounded-full bg-cyan-300" /> A4
            </div>
            <div className="h-[280px] overflow-hidden rounded-[24px] border border-slate-800 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <div className="pointer-events-none relative h-full w-full rounded-[20px] border border-slate-200 bg-white">
                <div className="absolute inset-x-6 top-6 h-2 rounded-full bg-slate-200" />
                <div className="absolute left-6 top-16 h-3 w-24 rounded-full bg-slate-200" />
                <div className="absolute left-6 top-28 h-2 w-32 rounded-full bg-slate-200" />
                <div className="absolute left-6 top-40 h-2 w-28 rounded-full bg-slate-200" />
                <div className="absolute left-6 bottom-28 h-10 w-28 rounded-2xl border border-slate-200 bg-slate-100" />
                <div className="absolute right-6 top-32 h-4 w-16 rounded-full bg-slate-200" />
                <div className="absolute right-6 top-48 h-2 w-28 rounded-full bg-slate-200" />
                <div className="absolute left-6 bottom-12 h-2 w-40 rounded-full bg-slate-200" />
                <div className="absolute left-6 bottom-6 h-3 w-20 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-5 bottom-5 translate-y-6 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" className="rounded-[24px] px-4 py-3" onClick={() => onOpenPreview(template.id)}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button type="button" variant="secondary" className="rounded-[24px] px-4 py-3" onClick={() => onEdit(template.id)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button type="button" variant="ghost" className="rounded-[24px] px-4 py-3" onClick={() => onDuplicate(template.id)}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
