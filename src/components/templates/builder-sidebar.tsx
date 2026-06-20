'use client';

import { useMemo, useState } from 'react';
import { Search, Plus, GripVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateBlockType } from '@/lib/template-builder';
import { TEMPLATE_BLOCK_TYPES } from '@/lib/template-builder';

interface BuilderSidebarProps {
  onInsertBlock: (type: TemplateBlockType) => void;
}

const blockCategoryGroups: { title: string; types: TemplateBlockType[] }[] = [
  { title: 'Headers', types: ['header'] },
  { title: 'Layout', types: ['paragraph', 'divider', 'image'] },
  { title: 'Compensation', types: ['compensation'] },
  { title: 'Branding', types: ['image'] },
  { title: 'Signatures', types: ['signature'] },
  { title: 'Benefits', types: ['benefits'] },
  { title: 'CTA sections', types: ['cta'] },
  { title: 'Candidate sections', types: ['candidateSummary'] },
];

const blockPreviewCopy: Record<TemplateBlockType, string> = {
  header: 'Bold page heading for your offer summary.',
  paragraph: 'A rich text section for tone, details, and offer context.',
  compensation: 'Compensation table with salary, bonus, and deadlines.',
  signature: 'Signature section for approvals and official sign-off.',
  candidateSummary: 'Candidate and role summary in a clean sidebar card.',
  benefits: 'Benefit bullets for health, perks, and growth.',
  cta: 'Action section with a strong CTA message and button.',
  image: 'Brand emblem, logo, or supporting visual asset.',
  divider: 'Soft divider to separate sections elegantly.',
};

export function BuilderSidebar({ onInsertBlock }: BuilderSidebarProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(
    () =>
      blockCategoryGroups.map((group) => ({
        ...group,
        types: group.types.filter((type) =>
          TEMPLATE_BLOCK_TYPES.find((item) => item.type === type)?.label.toLowerCase().includes(search.toLowerCase()) ||
          blockPreviewCopy[type].toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.types.length > 0),
    [search]
  );

  return (
    <aside className="builder-sidebar rounded-[32px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_30px_60px_rgba(3,9,26,0.42)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Blocks library</p>
          <h2 className="text-xl font-semibold text-white">Insert sections</h2>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/80 text-cyan-300 shadow-[0_20px_40px_rgba(34,211,238,0.12)]">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <div className="mb-5 rounded-[24px] border border-slate-800 bg-slate-900/80 px-4 py-3">
        <label className="sr-only" htmlFor="block-search">Search blocks</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="block-search"
            type="search"
            value={search}
            placeholder="Search sections"
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      </div>
      <div className="space-y-5">
        {filteredCategories.map((group) => (
          <div key={group.title} className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{group.title}</p>
            <div className="mt-4 space-y-3">
              {group.types.map((type) => {
                const item = TEMPLATE_BLOCK_TYPES.find((entry) => entry.type === type);
                if (!item) return null;
                return (
                  <div key={type} className="group rounded-[24px] border border-slate-800 bg-slate-950/90 p-4 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-[0_24px_80px_rgba(6,10,28,0.24)]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-cyan-300">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-white">{item.label}</p>
                          <p className="mt-1 text-sm text-slate-500">{blockPreviewCopy[type]}</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" className="rounded-full p-3" onClick={() => onInsertBlock(type)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
