'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, SunMedium, Palette, SlidersHorizontal, Eye, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/input';
import type { TemplateBlock, TemplateCustomization } from '@/lib/template-builder';
import { TEMPLATE_BLOCK_TYPES } from '@/lib/template-builder';

interface PropertyPanelProps {
  selectedBlock: TemplateBlock | null;
  customization: TemplateCustomization;
  variablesUsed: string[];
  onUpdateBlock: (block: TemplateBlock) => void;
  onUpdateCustomization: (next: TemplateCustomization) => void;
  onDuplicateBlock: () => void;
  onRemoveBlock: () => void;
}

function Section({ title, description, open, onToggle, children }: { title: string; description?: string; open: boolean; onToggle: () => void; children: React.ReactNode; }) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left" onClick={onToggle}>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p>
          {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
        </div>
        <ChevronDown className={`h-5 w-5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="border-t border-slate-800 p-5">{children}</div> : null}
    </div>
  );
}

export function PropertyPanel({ selectedBlock, customization, variablesUsed, onUpdateBlock, onUpdateCustomization, onDuplicateBlock, onRemoveBlock }: PropertyPanelProps) {
  const [openSections, setOpenSections] = useState({ block: true, design: true, advanced: true });

  const selectedLabel = useMemo(() => {
    if (!selectedBlock) return 'No section selected';
    return TEMPLATE_BLOCK_TYPES.find((item) => item.type === selectedBlock.type)?.label ?? 'Section';
  }, [selectedBlock]);

  const updateBlock = (patch: Partial<TemplateBlock>) => {
    if (!selectedBlock) return;
    onUpdateBlock({ ...selectedBlock, ...patch } as TemplateBlock);
  };

  return (
    <aside className="property-panel space-y-5 rounded-[32px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_30px_60px_rgba(3,9,26,0.45)]">
      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Properties</p>
            <h2 className="text-lg font-semibold text-white">{selectedLabel}</h2>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" className="rounded-full px-4 py-2" onClick={onDuplicateBlock}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </Button>
          <Button type="button" variant="ghost" className="rounded-full px-4 py-2" onClick={onRemoveBlock}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      </div>

      <Section
        title="Block settings"
        description="Customize the selected section quickly."
        open={openSections.block}
        onToggle={() => setOpenSections((prev) => ({ ...prev, block: !prev.block }))}
      >
        {!selectedBlock ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-6 text-sm text-slate-400">Select a section on the canvas to edit its properties.</div>
        ) : (
          <div className="space-y-4">
            {'text' in selectedBlock && (
              <>
                <label className="text-sm font-medium text-slate-400">Text content</label>
                <Textarea value={selectedBlock.text ?? ''} onChange={(event) => updateBlock({ text: event.target.value })} rows={4} />
              </>
            )}
            {selectedBlock.type === 'header' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-400">Heading level</label>
                  <Select value={selectedBlock.level} onChange={(event) => updateBlock({ level: Number(event.target.value) as 1 | 2 | 3 })}>
                    <option value={1}>H1 - Bold</option>
                    <option value={2}>H2 - Strong</option>
                    <option value={3}>H3 - Standard</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Alignment</label>
                  <Select value={selectedBlock.align} onChange={(event) => updateBlock({ align: event.target.value as 'left' | 'center' | 'right' })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </Select>
                </div>
              </div>
            )}
            {selectedBlock.type === 'paragraph' && (
              <div>
                <label className="text-sm font-medium text-slate-400">Alignment</label>
                <Select value={selectedBlock.align} onChange={(event) => updateBlock({ align: event.target.value as 'left' | 'center' | 'right' })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </Select>
              </div>
            )}
            {selectedBlock.type === 'compensation' && (
              <>
                <label className="text-sm font-medium text-slate-400">Section title</label>
                <Input value={selectedBlock.title} onChange={(event) => updateBlock({ title: event.target.value })} />
                <div className="space-y-3">
                  {selectedBlock.rows.map((row, index) => (
                    <div key={index} className="grid gap-3 sm:grid-cols-2">
                      <Input value={row.label} onChange={(event) => {
                        const next = [...selectedBlock.rows];
                        next[index] = { ...next[index], label: event.target.value };
                        updateBlock({ rows: next });
                      }} placeholder="Label" />
                      <Input value={row.value} onChange={(event) => {
                        const next = [...selectedBlock.rows];
                        next[index] = { ...next[index], value: event.target.value };
                        updateBlock({ rows: next });
                      }} placeholder="Value" />
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedBlock.type === 'signature' && (
              <>
                <label className="text-sm font-medium text-slate-400">Signer name</label>
                <Input value={selectedBlock.name} onChange={(event) => updateBlock({ name: event.target.value })} />
                <label className="text-sm font-medium text-slate-400">Signer title</label>
                <Input value={selectedBlock.title} onChange={(event) => updateBlock({ title: event.target.value })} />
              </>
            )}
            {selectedBlock.type === 'benefits' && (
              <>
                <label className="text-sm font-medium text-slate-400">Section title</label>
                <Input value={selectedBlock.title} onChange={(event) => updateBlock({ title: event.target.value })} />
                <div className="space-y-3">
                  {selectedBlock.bullets.map((bullet, index) => (
                    <Textarea key={index} rows={2} value={bullet} onChange={(event) => {
                      const next = [...selectedBlock.bullets];
                      next[index] = event.target.value;
                      updateBlock({ bullets: next });
                    }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Section>

      <Section
        title="Document design"
        description="Fine tune the look and brand of your offer letter."
        open={openSections.design}
        onToggle={() => setOpenSections((prev) => ({ ...prev, design: !prev.design }))}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-400">Brand color</label>
            <Input type="color" value={customization.brandColor} onChange={(event) => onUpdateCustomization({ ...customization, brandColor: event.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">Accent color</label>
            <Input type="color" value={customization.accentColor} onChange={(event) => onUpdateCustomization({ ...customization, accentColor: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-400">Background</label>
              <Input type="color" value={customization.backgroundColor} onChange={(event) => onUpdateCustomization({ ...customization, backgroundColor: event.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Text</label>
              <Input type="color" value={customization.textColor} onChange={(event) => onUpdateCustomization({ ...customization, textColor: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">Font family</label>
            <Select value={customization.fontFamily} onChange={(event) => onUpdateCustomization({ ...customization, fontFamily: event.target.value })}>
              <option value="Inter, ui-sans-serif, system-ui, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Segoe UI, sans-serif">Segoe UI</option>
              <option value="Arial, sans-serif">Arial</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">Page padding</label>
            <Input type="range" min={16} max={72} value={customization.contentPadding} onChange={(event) => onUpdateCustomization({ ...customization, contentPadding: Number(event.target.value) })} />
            <p className="mt-2 text-sm text-slate-400">{customization.contentPadding}px</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="page-shadow"
              type="checkbox"
              checked={customization.pageShadow}
              onChange={(event) => onUpdateCustomization({ ...customization, pageShadow: event.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500"
            />
            <label htmlFor="page-shadow" className="text-sm text-slate-300">Enable page shadow</label>
          </div>
        </div>
      </Section>

      <Section
        title="Quick references"
        description="Variables in use across the document."
        open={openSections.advanced}
        onToggle={() => setOpenSections((prev) => ({ ...prev, advanced: !prev.advanced }))}
      >
        <div className="grid gap-3">
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
            <p className="text-slate-300">Live variables</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {variablesUsed.length > 0 ? (
                variablesUsed.map((variable) => (
                  <span key={variable} className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {variable}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">No variables detected yet.</p>
              )}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
            <div className="flex items-center gap-3 text-slate-300">
              <Eye className="h-4 w-4 text-cyan-300" />
              <p>Preview updates automatically as you edit.</p>
            </div>
          </div>
        </div>
      </Section>
    </aside>
  );
}
