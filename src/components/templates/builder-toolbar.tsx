'use client';

import { motion } from 'framer-motion';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  Save,
  Eye,
  TextCursor,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateBlock } from '@/lib/template-builder';
import { hoverGrow } from '@/lib/motion';

interface BuilderToolbarProps {
  selectedBlock: TemplateBlock | null;
  zoom: number;
  previewOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onTogglePreview: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onExportPdf: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTypographyChange: (level: 1 | 2 | 3) => void;
  onAlignmentChange: (align: 'left' | 'center' | 'right') => void;
  onSpacingChange: (delta: number) => void;
}

export function BuilderToolbar({
  selectedBlock,
  zoom,
  previewOpen,
  canUndo,
  canRedo,
  onTogglePreview,
  onZoomIn,
  onZoomOut,
  onSave,
  onExportPdf,
  onUndo,
  onRedo,
  onTypographyChange,
  onAlignmentChange,
  onSpacingChange,
}: BuilderToolbarProps) {
  const blockLabel = selectedBlock ? selectedBlock.type.replace(/([A-Z])/g, ' $1') : 'No block selected';
  const currentHeading = selectedBlock?.type === 'header' ? selectedBlock.level : 0;
  const currentAlign = selectedBlock && 'align' in selectedBlock ? selectedBlock.align : 'left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="builder-toolbar sticky top-5 z-30 rounded-[32px] border border-slate-800 bg-slate-950/90 px-5 py-4 shadow-[0_32px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300 ring-1 ring-slate-700">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span className="font-medium text-white">Premium editing canvas</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="font-semibold text-white">{blockLabel}</span>
            {selectedBlock ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-300">{selectedBlock.type}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" className="rounded-full px-4 py-3" onClick={onUndo} disabled={!canUndo}>
            <RotateCcw className="mr-2 h-4 w-4" /> Undo
          </Button>
          <Button type="button" variant="ghost" className="rounded-full px-4 py-3" onClick={onRedo} disabled={!canRedo}>
            <RotateCw className="mr-2 h-4 w-4" /> Redo
          </Button>
          <Button type="button" variant="secondary" className="rounded-full px-4 py-3" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button type="button" variant="secondary" className="rounded-full px-4 py-3" onClick={onExportPdf}>
            <TextCursor className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button type="button" variant="ghost" className="rounded-full px-4 py-3" onClick={onTogglePreview}>
            <Eye className="mr-2 h-4 w-4" /> {previewOpen ? 'Hide preview' : 'Show preview'}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Typography</span>
            <span className="text-xs text-slate-400">{selectedBlock ? 'Context aware' : 'Select a block'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3].map((level) => (
              <Button
                key={level}
                type="button"
                variant={currentHeading === level ? 'secondary' : 'ghost'}
                className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em]"
                onClick={() => onTypographyChange(level as 1 | 2 | 3)}
                disabled={!selectedBlock || selectedBlock.type !== 'header'}
              >
                H{level}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Alignment</span>
            <span className="text-xs text-slate-400">Snap layout</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant={currentAlign === 'left' ? 'secondary' : 'ghost'} className="rounded-full p-3" onClick={() => onAlignmentChange('left')}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant={currentAlign === 'center' ? 'secondary' : 'ghost'} className="rounded-full p-3" onClick={() => onAlignmentChange('center')}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant={currentAlign === 'right' ? 'secondary' : 'ghost'} className="rounded-full p-3" onClick={() => onAlignmentChange('right')}>
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-3 rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Spacing</span>
            <span className="text-xs text-slate-400">Page padding</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="rounded-full p-3" onClick={() => onSpacingChange(-8)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" className="rounded-full p-3" onClick={() => onSpacingChange(8)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Viewport</span>
            <span className="text-xs text-slate-400">Zoom {zoom}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="rounded-full p-3" onClick={onZoomOut}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" className="rounded-full p-3" onClick={onZoomIn}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
