'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTemplate, useTemplateList, useDuplicateTemplate } from '@/hooks/use-templates';
import type { OfferTemplateItem, TemplateDetail } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateMarketplaceHero } from '@/components/templates/template-marketplace-hero';
import { TemplateCard } from '@/components/templates/template-card';
import { TemplatePreviewModal } from '@/components/templates/template-preview-modal';
import { fadeInUp, staggerContainer } from '@/lib/motion';

export function TemplateListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  const params = useMemo(() => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('limit', '12');
    if (search) query.set('search', search);
    return query;
  }, [page, search]);

  const templatesQuery = useTemplateList(params);
  const duplicateTemplate = useDuplicateTemplate();
  const previewQuery = useTemplate(previewTemplateId ?? '');

  const templates = useMemo(() => (templatesQuery.data?.data ?? []) as OfferTemplateItem[], [templatesQuery.data]);
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(templates.map((template) => template.category))).sort()],
    [templates]
  );

  const filteredTemplates = useMemo(
    () => templates.filter((template) => selectedCategory === 'all' || template.category === selectedCategory),
    [templates, selectedCategory]
  );

  const trendingTemplates = useMemo(
    () => [...templates].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
    [templates]
  );
  const recommendedTemplates = useMemo(() => templates.slice(0, 4), [templates]);
  const spotlightTemplates = useMemo(() => templates.slice(0, 5), [templates]);

  useEffect(() => {
    const storedFavorites = window.localStorage.getItem('templateFavorites');
    const storedRecents = window.localStorage.getItem('templateRecents');

    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites) as string[];
        setFavoriteIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setFavoriteIds([]);
      }
    }

    if (storedRecents) {
      try {
        const parsed = JSON.parse(storedRecents) as string[];
        setRecentIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setRecentIds([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('templateFavorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    window.localStorage.setItem('templateRecents', JSON.stringify(recentIds));
  }, [recentIds]);

  const toggleFavorite = (templateId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
  };

  const openPreview = (templateId: string) => {
    setPreviewTemplateId(templateId);
    setPreviewOpen(true);
    setRecentIds((prev) => [templateId, ...prev.filter((id) => id !== templateId)].slice(0, 10));
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const templateDetail = previewQuery.data as TemplateDetail | undefined;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <TemplateMarketplaceHero
          templates={templates}
          categories={categories}
          selectedCategory={selectedCategory}
          onSearch={setSearch}
          onSelectCategory={setSelectedCategory}
          heroSlide={heroSlide}
          onNextSlide={() => setHeroSlide((current) => (current + 1) % Math.max(1, spotlightTemplates.length))}
          onPrevSlide={() => setHeroSlide((current) => (current - 1 + Math.max(1, spotlightTemplates.length)) % Math.max(1, spotlightTemplates.length))}
        />

        <aside className="rounded-[34px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Template guidance</p>
            <h2 className="text-3xl font-semibold text-white">Create offers with confidence</h2>
            <p className="text-sm leading-7 text-slate-400">Choose polished templates that save time, reduce review cycles, and keep your team aligned around a modern candidate experience.</p>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Why this marketplace?</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-400">
                <li>Preview designs before editing</li>
                <li>Favorite top templates for repeat use</li>
                <li>Duplicate polished content instantly</li>
              </ul>
            </div>
            <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Templates available</p>
                <p className="mt-2 text-3xl font-semibold text-white">{templatesQuery.isLoading ? '...' : templates.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Favorites</p>
                <p className="mt-2 text-3xl font-semibold text-cyan-300">{favoriteIds.length}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[34px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Trending templates</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Fresh styles for top offers</h3>
            </div>
            <Badge className="rounded-full border-slate-700 bg-slate-900/70 text-slate-300">Live now</Badge>
          </div>
          <div className="marketplace-scroll mt-6 flex gap-4 overflow-x-auto pb-2">
            {trendingTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => openPreview(template.id)}
                className="min-w-[280px] flex-shrink-0 rounded-[28px] border border-slate-800 bg-slate-900/95 p-5 text-left shadow-[0_24px_70px_rgba(6,10,28,0.24)] transition hover:border-cyan-500/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-300">{template.category}</span>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.32)]" />
                </div>
                <div className="mt-5 space-y-3">
                  <h4 className="text-lg font-semibold text-white">{template.title}</h4>
                  <p className="text-sm leading-6 text-slate-400 line-clamp-3">{template.description ?? 'A polished offer letter design for modern hiring teams.'}</p>
                </div>
                <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-950/90 p-4">
                  <div className="h-3 w-24 rounded-full bg-slate-700" />
                  <div className="mt-3 h-2 w-32 rounded-full bg-slate-700" />
                  <div className="mt-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signature</p>
                    <p className="mt-2 text-sm font-semibold text-white">Hiring manager</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Recently used</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Resume from your last previews</h3>
            </div>
            <Badge className="rounded-full border-slate-700 bg-slate-900/70 text-slate-300">Fast pick</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {(recentIds.length > 0 ? recentIds.map((id) => templates.find((template) => template.id === id)).filter(Boolean) : templates.slice(0, 3)).map((template) => (
              <button
                key={template!.id}
                type="button"
                onClick={() => openPreview(template!.id)}
                className="group w-full rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-cyan-500/40 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{template!.category}</p>
                    <p className="mt-2 text-base font-semibold text-white group-hover:text-cyan-300">{template!.title}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">Preview</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400 line-clamp-2">{template!.description ?? 'A compelling offer layout built for fast approvals and candidate delight.'}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Premium gallery</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Visual offer letter marketplace</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">A richly curated browsing experience for modern offer letters, hiring briefs, and candidate communications.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={() => router.push('/templates/new')}>
              <Plus className="mr-2 h-4 w-4" /> New template
            </Button>
            <Button type="button" variant="secondary" className="rounded-3xl" onClick={() => { setSearch(''); setSelectedCategory('all'); setPage(1); }}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategory === category ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200 shadow-[0_0_0_2px_rgba(34,211,238,0.12)]' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-500/40 hover:text-white'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All categories' : category}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/80 p-12 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">No matching templates</p>
              <h3 className="mt-4 text-2xl font-semibold text-white">Your next offer design is still waiting</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">Refine the search, expand categories, or preview one of our curated starter templates below to keep hiring momentum alive.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {recommendedTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => openPreview(template.id)}
                    className="rounded-[24px] border border-slate-800 bg-slate-950/90 px-4 py-5 text-left text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
                  >
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{template.category}</p>
                    <p className="mt-3 text-base font-semibold text-white">{template.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-2">{template.description ?? 'A high-impact template built for fast offer turnaround.'}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="masonry-grid">
              {filteredTemplates.map((template) => (
                <motion.div key={template.id} variants={fadeInUp}>
                  <TemplateCard
                    template={template}
                    isFavorite={favoriteIds.includes(template.id)}
                    onOpenPreview={openPreview}
                    onEdit={(id) => router.push(`/templates/${id}/edit`)}
                    onDuplicate={(id) => duplicateTemplate.mutate(id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5 text-sm text-slate-400">
          <span>{templatesQuery.isLoading ? 'Loading templates...' : `${filteredTemplates.length} templates shown`}</span>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full border-slate-700 bg-slate-900/70 text-slate-300">Page {page}</Badge>
            <Button type="button" variant="ghost" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPage((value) => value + 1)}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <TemplatePreviewModal
        open={previewOpen}
        template={templateDetail ?? null}
        onClose={closePreview}
        onUse={(id) => duplicateTemplate.mutate(id)}
        onEdit={(id) => router.push(`/templates/${id}/edit`)}
        isFavorite={previewTemplateId ? favoriteIds.includes(previewTemplateId) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
