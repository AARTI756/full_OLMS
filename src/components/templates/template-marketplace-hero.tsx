'use client';

import { motion } from 'framer-motion';
import { Sparkles, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateCardPreview } from '@/components/templates/template-card-preview';
import type { OfferTemplateItem } from '@/types/template';

interface TemplateMarketplaceHeroProps {
  templates: OfferTemplateItem[];
  categories: string[];
  selectedCategory: string;
  onSearch: (value: string) => void;
  onSelectCategory: (category: string) => void;
  heroSlide: number;
  onNextSlide: () => void;
  onPrevSlide: () => void;
}

export function TemplateMarketplaceHero({
  templates,
  categories,
  selectedCategory,
  onSearch,
  onSelectCategory,
  heroSlide,
  onNextSlide,
  onPrevSlide,
}: TemplateMarketplaceHeroProps) {
  const featured = templates.slice(0, 5);
  const spotlight = featured[heroSlide % Math.max(1, featured.length)] ?? featured[0];

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-slate-800/80 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-slate-900/95 p-8 shadow-[0_40px_120px_rgba(8,15,35,0.32)] hero-spotlight">
      <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-16 h-40 w-40 rounded-full bg-slate-500/10 blur-3xl" />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/20">
            <Sparkles className="h-4 w-4" />
            <span>Visual template marketplace</span>
          </div>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Discover offer designs</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Browse premium offer letter templates</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-400">Explore a gallery of polished templates built for executive offers, equity packages, startup hiring, and enterprise approvals. Start quickly with curated launch paths for your next role.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="secondary" className="rounded-3xl shadow-[0_20px_60px_rgba(45,212,191,0.18)] hover:shadow-[0_26px_80px_rgba(45,212,191,0.24)]" onClick={() => onSelectCategory('all')}>
              Explore categories
            </Button>
            <Button variant="ghost" className="rounded-3xl border border-slate-800/70 bg-slate-900/80 text-white hover:bg-slate-900/95" onClick={() => onSearch('')}>
              <ExternalLink className="mr-2 h-4 w-4" /> Browse all templates
            </Button>
          </div>
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
            <label className="mb-2 block text-sm font-medium text-slate-400">Search templates</label>
            <input
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
              type="search"
              placeholder="Search engineering, executive, startup..."
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] transition ${
                  selectedCategory === category
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.18)]'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
                onClick={() => onSelectCategory(category)}
              >
                {category === 'all' ? 'All categories' : category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Spotlight</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{spotlight?.title ?? 'Featured template'}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" className="rounded-full p-3" onClick={onPrevSlide}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" className="rounded-full p-3" onClick={onNextSlide}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-5">
              <TemplateCardPreview
                title={spotlight?.title ?? 'Featured template'}
                category={spotlight?.category ?? 'Executive'}
                description={spotlight?.description}
              />
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featured.slice(1, 3).map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/90 shadow-2xl shadow-slate-950/20"
              >
                <TemplateCardPreview
                  title={template.title}
                  category={template.category}
                  description={template.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
