'use client';

import { motion } from 'framer-motion';

interface TemplateCardPreviewProps {
  title: string;
  category: string;
  description?: string | null;
  content?: string;
}

export function TemplateCardPreview({ title, category, description, content }: TemplateCardPreviewProps) {
  const previewHtml = content ?? '<div class="flex h-full items-center justify-center p-5 text-sm text-slate-500">Preview sample layout</div>';

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 transition duration-300 hover:border-cyan-500/40 hover:shadow-[0_40px_120px_rgba(14,165,233,0.12)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-300">{category}</span>
        <span className="inline-flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)]" />
      </div>
      <div className="mt-5 space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-slate-400 line-clamp-3">{description ?? 'A polished, brand-ready offer template for modern hiring teams.'}</p>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/90 p-4 shadow-inner shadow-slate-950/20">
        <div className="absolute -left-6 top-6 h-[calc(100%-1.5rem)] w-full rounded-[28px] border border-slate-800/40 bg-slate-950/40 blur-xl" />
        <div className="absolute -right-6 top-10 h-[calc(100%-2rem)] w-full rounded-[28px] border border-slate-800/40 bg-slate-950/40 blur-xl" />
        <div className="relative overflow-hidden rounded-[24px] border border-slate-800 bg-white p-4 shadow-[0_26px_70px_rgba(15,23,42,0.12)]">
          <div className="absolute left-4 top-4 h-2 w-24 rounded-full bg-slate-100/90 blur-sm" />
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-slate-500">
            A4 preview
          </div>
          <div className="space-y-4 pt-10">
            <div className="h-3 w-28 rounded-full bg-slate-200" />
            <div className="h-2 w-20 rounded-full bg-slate-200" />
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-100/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total comp</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">$148,000</p>
            </div>
            <div className="grid gap-2">
              <div className="h-2 w-24 rounded-full bg-slate-200" />
              <div className="h-2 w-32 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center gap-3 rounded-[18px] border border-slate-200/70 bg-slate-50 p-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signature</p>
                <p className="text-sm font-semibold text-slate-900">Hiring manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
