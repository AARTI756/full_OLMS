'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pdf } from '@react-pdf/renderer';
import { TemplatePdfDocument } from '@/components/templates/template-pdf-document';
import { TemplateVariablePicker } from '@/components/templates/template-variable-picker';
import { TemplatePreview } from '@/components/templates/template-preview';
import { BuilderToolbar } from '@/components/templates/builder-toolbar';
import { BuilderSidebar } from '@/components/templates/builder-sidebar';
import { PropertyPanel } from '@/components/templates/property-panel';
import {
  renderTemplateContent,
  DEFAULT_TEMPLATE_PREVIEW_CONTEXT,
  parseTemplatePlaceholders,
} from '@/lib/template-variables';
import {
  TemplateBlock,
  TemplateBlockType,
  TEMPLATE_BLOCK_TYPES,
  getBlockSummary,
  createTemplateBlock,
  convertHtmlToBlocks,
  serializeBlocksToHtml,
  insertVariableIntoBlock,
  DEFAULT_TEMPLATE_CUSTOMIZATION,
  TemplateCustomization,
} from '@/lib/template-builder';

interface TemplateBuilderProps {
  content: string;
  onChange: (value: string) => void;
}

function SortableBlockItem({
  block,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
}: {
  block: TemplateBlock;
  selected: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`rounded-[32px] border p-4 shadow-sm transition duration-300 ${
        selected ? 'border-cyan-500/60 bg-slate-900 shadow-[0_24px_80px_rgba(34,211,238,0.12)]' : 'border-slate-800 bg-slate-950/90'
      } ${isDragging ? 'opacity-90 scale-[1.01]' : ''}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-cyan-500/40 hover:text-white"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-semibold text-white">{TEMPLATE_BLOCK_TYPES.find((item) => item.type === block.type)?.label}</p>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{getBlockSummary(block)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="rounded-full p-3" onClick={() => onDuplicate(block.id)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="rounded-full p-3" onClick={() => onRemove(block.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSelect(block.id)}
        className={`w-full rounded-[28px] border px-4 py-4 text-left text-sm transition ${
          selected ? 'border-cyan-500/60 bg-slate-900 text-white' : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-900'
        }`}
      >
        <div className="font-medium">Tap to edit</div>
        <div className="mt-2 text-xs text-slate-500">Drag the handle to reorder, or click to refine content.</div>
      </button>
    </motion.div>
  );
}

export function TemplateBuilder({ content, onChange }: TemplateBuilderProps) {
  const [blocks, setBlocks] = useState<TemplateBlock[]>(() => convertHtmlToBlocks(content));
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id ?? '');
  const [customization, setCustomization] = useState<TemplateCustomization>(DEFAULT_TEMPLATE_CUSTOMIZATION);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const historyRef = useRef<{ blocks: TemplateBlock[]; customization: TemplateCustomization }[]>([]);
  const futureRef = useRef<{ blocks: TemplateBlock[]; customization: TemplateCustomization }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!blocks.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(blocks[0]?.id ?? '');
    }
  }, [blocks, selectedBlockId]);

  useEffect(() => {
    onChange(serializeBlocksToHtml(blocks, customization));
  }, [blocks, customization, onChange]);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const serialized = useMemo(() => serializeBlocksToHtml(blocks, customization), [blocks, customization]);
  const previewHtml = useMemo(() => renderTemplateContent(serialized, DEFAULT_TEMPLATE_PREVIEW_CONTEXT), [serialized]);
  const variablesUsed = useMemo(() => parseTemplatePlaceholders(serialized), [serialized]);

  const commitState = useCallback(
    (nextBlocks: TemplateBlock[], nextCustomization?: TemplateCustomization) => {
      historyRef.current = [...historyRef.current, { blocks, customization }];
      futureRef.current = [];
      setCanUndo(historyRef.current.length > 0);
      setCanRedo(false);
      setBlocks(nextBlocks);
      if (nextCustomization) {
        setCustomization(nextCustomization);
      }
    },
    [blocks, customization]
  );

  const updateBlock = useCallback(
    (block: TemplateBlock) => {
      const next = blocks.map((item) => (item.id === block.id ? block : item));
      commitState(next);
    },
    [blocks, commitState]
  );

  const addBlock = useCallback(
    (type: TemplateBlockType) => {
      const next = [...blocks, createTemplateBlock(type)];
      commitState(next);
      setSelectedBlockId(next[next.length - 1].id);
    },
    [blocks, commitState]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const index = blocks.findIndex((item) => item.id === id);
      if (index === -1) return;
      const copy = { ...blocks[index], id: `${blocks[index].id}-copy-${Date.now()}` };
      const next = [...blocks];
      next.splice(index + 1, 0, copy);
      commitState(next);
      setSelectedBlockId(copy.id);
    },
    [blocks, commitState]
  );

  const removeBlock = useCallback(
    (id: string) => {
      const next = blocks.filter((item) => item.id !== id);
      commitState(next);
      if (selectedBlockId === id) {
        setSelectedBlockId(next[0]?.id ?? '');
      }
    },
    [blocks, commitState, selectedBlockId]
  );

  const updateCustomization = useCallback(
    (nextCustomization: TemplateCustomization) => {
      commitState(blocks, nextCustomization);
    },
    [blocks, commitState]
  );

  const insertVariable = useCallback(
    (variable: string) => {
      if (!selectedBlock) return;
      updateBlock(insertVariableIntoBlock(selectedBlock, variable));
    },
    [selectedBlock, updateBlock]
  );

  const handleSave = useCallback(() => {
    onChange(serializeBlocksToHtml(blocks, customization));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }, [blocks, customization, onChange]);

  const handleExportPdf = useCallback(async () => {
    try {
      const blob = await pdf(
        <TemplatePdfDocument title="Live template export" renderedContent={previewHtml} context={DEFAULT_TEMPLATE_PREVIEW_CONTEXT} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-export.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Unable to export PDF at this time.');
    }
  }, [previewHtml]);

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    const previous = historyRef.current[historyRef.current.length - 1];
    const nextFuture = [{ blocks, customization }, ...futureRef.current];
    historyRef.current = historyRef.current.slice(0, -1);
    futureRef.current = nextFuture;
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(nextFuture.length > 0);
    setBlocks(previous.blocks);
    setCustomization(previous.customization);
  }, [blocks, customization]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    const nextState = futureRef.current[0];
    const nextHistory = [...historyRef.current, { blocks, customization }];
    futureRef.current = futureRef.current.slice(1);
    historyRef.current = nextHistory;
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
    setBlocks(nextState.blocks);
    setCustomization(nextState.customization);
  }, [blocks, customization]);

  const handleAlignChange = useCallback(
    (align: 'left' | 'center' | 'right') => {
      if (!selectedBlock || !('align' in selectedBlock)) return;
      updateBlock({ ...selectedBlock, align });
    },
    [selectedBlock, updateBlock]
  );

  const handleTypographyChange = useCallback(
    (level: 1 | 2 | 3) => {
      if (!selectedBlock || selectedBlock.type !== 'header') return;
      updateBlock({ ...selectedBlock, level });
    },
    [selectedBlock, updateBlock]
  );

  const handleSpacingChange = useCallback(
    (delta: number) => {
      updateCustomization({ ...customization, contentPadding: Math.max(18, customization.contentPadding + delta) });
    },
    [customization, updateCustomization]
  );

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      if (!over || active.id === over.id) return;
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        commitState(arrayMove(blocks, oldIndex, newIndex));
      }
    },
    [blocks, commitState]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSave();
      }
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && ((event.shiftKey && event.key.toLowerCase() === 'z') || event.key.toLowerCase() === 'y')) {
        event.preventDefault();
        redo();
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        if (selectedBlockId) duplicateBlock(selectedBlockId);
      }
      if (!isInput && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        if (selectedBlockId) removeBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, undo, redo, selectedBlockId, duplicateBlock, removeBlock]);

  const activeBlock = activeId ? blocks.find((block) => block.id === activeId) : null;

  return (
    <div className="space-y-6">
      <BuilderToolbar
        selectedBlock={selectedBlock}
        zoom={previewZoom}
        previewOpen={previewOpen}
        canUndo={canUndo}
        canRedo={canRedo}
        onTogglePreview={() => setPreviewOpen((value) => !value)}
        onZoomIn={() => setPreviewZoom((value) => Math.min(150, value + 10))}
        onZoomOut={() => setPreviewZoom((value) => Math.max(75, value - 10))}
        onSave={handleSave}
        onExportPdf={handleExportPdf}
        onUndo={undo}
        onRedo={redo}
        onTypographyChange={handleTypographyChange}
        onAlignmentChange={handleAlignChange}
        onSpacingChange={handleSpacingChange}
      />

      {saved ? (
        <div className="sticky top-24 z-20 mx-auto w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 shadow-[0_18px_45px_rgba(16,185,129,0.18)]">
          Design saved
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1.7fr_430px]">
        <BuilderSidebar onInsertBlock={addBlock} />

        <div className="space-y-6">
          <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_30px_60px_rgba(3,9,26,0.42)]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Canvas</p>
                <h2 className="text-2xl font-semibold text-white">Design the document experience</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Use the sidebar to insert polished sections and drag them into a premium offer document flow.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                Tip: use <span className="text-white">Ctrl/Cmd + Z</span> to undo and <span className="text-white">Delete</span> to remove sections.
              </div>
            </div>

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {blocks.map((block) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      selected={block.id === selectedBlockId}
                      onSelect={setSelectedBlockId}
                      onDuplicate={duplicateBlock}
                      onRemove={removeBlock}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeBlock ? (
                  <div className="pointer-events-none rounded-[32px] border border-cyan-500/30 bg-slate-950/95 p-5 shadow-[0_40px_120px_rgba(6,10,28,0.4)]">
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Moving section</p>
                    <p className="mt-3 text-lg font-semibold text-white">{TEMPLATE_BLOCK_TYPES.find((item) => item.type === activeBlock.type)?.label}</p>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{getBlockSummary(activeBlock)}</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_30px_60px_rgba(3,9,26,0.42)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Variables</p>
                <h3 className="text-xl font-semibold text-white">Insert dynamic tokens</h3>
              </div>
              <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">Live data</div>
            </div>
            <TemplateVariablePicker onInsert={insertVariable} />
          </section>
        </div>

        <div className="space-y-6">
          <PropertyPanel
            selectedBlock={selectedBlock}
            customization={customization}
            variablesUsed={variablesUsed}
            onUpdateBlock={updateBlock}
            onUpdateCustomization={updateCustomization}
            onDuplicateBlock={() => selectedBlockId && duplicateBlock(selectedBlockId)}
            onRemoveBlock={() => selectedBlockId && removeBlock(selectedBlockId)}
          />

          {previewOpen ? (
            <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_30px_60px_rgba(3,9,26,0.42)]">
              <TemplatePreview content={serialized} title="Live design preview" zoom={previewZoom} customization={customization} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
