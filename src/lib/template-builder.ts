'use client';

import { TEMPLATE_VARIABLES } from '@/lib/template-variables';
import type { TemplateRenderContext } from '@/lib/template-variables';

export type TemplateBlockType =
  | 'header'
  | 'paragraph'
  | 'compensation'
  | 'signature'
  | 'candidateSummary'
  | 'benefits'
  | 'cta'
  | 'image'
  | 'divider';

export interface TemplateBlockBase {
  id: string;
  type: TemplateBlockType;
}

export interface TemplateHeaderBlock extends TemplateBlockBase {
  type: 'header';
  text: string;
  level: 1 | 2 | 3;
  align: 'left' | 'center' | 'right';
}

export interface TemplateParagraphBlock extends TemplateBlockBase {
  type: 'paragraph';
  text: string;
  align: 'left' | 'center' | 'right';
}

export interface TemplateCompensationBlock extends TemplateBlockBase {
  type: 'compensation';
  title: string;
  rows: { label: string; value: string }[];
}

export interface TemplateSignatureBlock extends TemplateBlockBase {
  type: 'signature';
  name: string;
  title: string;
  note: string;
}

export interface TemplateCandidateSummaryBlock extends TemplateBlockBase {
  type: 'candidateSummary';
  intro: string;
  fields: string[];
}

export interface TemplateBenefitsBlock extends TemplateBlockBase {
  type: 'benefits';
  title: string;
  bullets: string[];
}

export interface TemplateCtaBlock extends TemplateBlockBase {
  type: 'cta';
  text: string;
  buttonText: string;
  align: 'left' | 'center' | 'right';
}

export interface TemplateImageBlock extends TemplateBlockBase {
  type: 'image';
  src: string;
  alt: string;
  width: number;
}

export interface TemplateDividerBlock extends TemplateBlockBase {
  type: 'divider';
  style: 'solid' | 'dashed' | 'double';
}

export type TemplateBlock =
  | TemplateHeaderBlock
  | TemplateParagraphBlock
  | TemplateCompensationBlock
  | TemplateSignatureBlock
  | TemplateCandidateSummaryBlock
  | TemplateBenefitsBlock
  | TemplateCtaBlock
  | TemplateImageBlock
  | TemplateDividerBlock;

export interface TemplateCustomization {
  brandColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  contentPadding: number;
  pageShadow: boolean;
}

export const DEFAULT_TEMPLATE_CUSTOMIZATION: TemplateCustomization = {
  brandColor: '#22d3ee',
  accentColor: '#38bdf8',
  backgroundColor: '#020617',
  textColor: '#f8fafc',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  contentPadding: 36,
  pageShadow: true,
};

export const TEMPLATE_BLOCK_LABELS: Record<TemplateBlockType, string> = {
  header: 'Header',
  paragraph: 'Paragraph',
  compensation: 'Compensation',
  signature: 'Signature',
  candidateSummary: 'Candidate summary',
  benefits: 'Benefits',
  cta: 'Call to action',
  image: 'Image / logo',
  divider: 'Divider',
};

export const TEMPLATE_BLOCK_TYPES: { type: TemplateBlockType; label: string }[] = [
  { type: 'header', label: 'Header' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'compensation', label: 'Compensation table' },
  { type: 'signature', label: 'Signature' },
  { type: 'candidateSummary', label: 'Candidate summary' },
  { type: 'benefits', label: 'Benefits' },
  { type: 'cta', label: 'CTA' },
  { type: 'image', label: 'Logo / image' },
  { type: 'divider', label: 'Divider' },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
}

export function createTemplateBlock(type: TemplateBlockType): TemplateBlock {
  const id = createUuid();

  switch (type) {
    case 'header':
      return { id, type, text: 'Offer overview', level: 1, align: 'left' };
    case 'paragraph':
      return { id, type, text: 'Introduce the candidate and outline the terms clearly, using placeholders where appropriate.', align: 'left' };
    case 'compensation':
      return {
        id,
        type,
        title: 'Compensation summary',
        rows: [
          { label: 'Base salary', value: '{{ctc}}' },
          { label: 'Joining bonus', value: '{{joiningDate}}' },
          { label: 'Acceptance deadline', value: '{{validUntil}}' },
        ],
      };
    case 'signature':
      return {
        id,
        type,
        name: 'Talent team',
        title: 'HR Partner',
        note: 'Please sign below to confirm your agreement with the terms above.',
      };
    case 'candidateSummary':
      return {
        id,
        type,
        intro: 'Candidate details',
        fields: ['{{candidateName}}', '{{designation}}', '{{department}}', '{{candidateEmail}}'],
      };
    case 'benefits':
      return {
        id,
        type,
        title: 'Benefits included',
        bullets: ['Flexible work schedule', 'Healthcare coverage', 'Learning stipend'],
      };
    case 'cta':
      return {
        id,
        type,
        text: 'Confirm this offer and send the candidate the official welcome packet.',
        buttonText: 'Approve offer',
        align: 'center',
      };
    case 'image':
      return {
        id,
        type,
        src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
        alt: 'Company branding',
        width: 280,
      };
    case 'divider':
      return {
        id,
        type,
        style: 'solid',
      };
    default:
      return { id, type: 'paragraph', text: '', align: 'left' };
  }
}

export function convertHtmlToBlocks(html: string): TemplateBlock[] {
  const stripped = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*\/h[1-6]\s*>/gi, '\n')
    .replace(/<.*?>/gi, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();

  if (!stripped) {
    return [createTemplateBlock('header'), createTemplateBlock('paragraph')];
  }

  const lines = stripped.split(/\n\n+/).map((line) => line.trim()).filter(Boolean);
  return lines.length > 1
    ? lines.map((line, index) => ({ id: createUuid(), type: index === 0 ? 'header' : 'paragraph', text: line, align: 'left' } as TemplateBlock))
    : [{ id: createUuid(), type: 'paragraph', text: stripped, align: 'left' }];
}

export function serializeBlocksToHtml(blocks: TemplateBlock[], customization: TemplateCustomization): string {
  const style = `
    :root {
      color-scheme: dark;
      --brand: ${customization.brandColor};
      --accent: ${customization.accentColor};
      --background: ${customization.backgroundColor};
      --text: ${customization.textColor};
      --font: ${customization.fontFamily};
      --padding: ${customization.contentPadding}px;
    }

    .builder-page {
      background: var(--background);
      color: var(--text);
      font-family: var(--font);
      min-height: 100vh;
      padding: 24px;
    }

    .builder-content {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(15, 23, 42, 0.9);
      border-radius: 32px;
      box-shadow: ${customization.pageShadow ? '0 30px 90px rgba(8, 16, 36, 0.55)' : 'none'};
      padding: var(--padding);
    }

    .builder-content h1,
    .builder-content h2,
    .builder-content h3 {
      color: var(--text);
      margin-top: 0;
    }

    .builder-content h1 { font-size: 2.4rem; }
    .builder-content h2 { font-size: 1.6rem; }
    .builder-content h3 { font-size: 1.2rem; }

    .builder-content p,
    .builder-content li {
      line-height: 1.8;
      color: var(--text);
      font-size: 1rem;
    }

    .builder-content .callout {
      padding: 20px;
      border-radius: 24px;
      background: rgba(14, 23, 38, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .builder-content table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(15, 23, 42, 0.96);
      margin: 18px 0;
    }

    .builder-content th,
    .builder-content td {
      padding: 12px 14px;
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .builder-content .signature {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid rgba(148, 163, 184, 0.12);
    }

    .builder-content .candidate-summary,
    .builder-content .benefits {
      padding: 22px;
      border-radius: 24px;
      background: rgba(2, 25, 44, 0.95);
      margin: 18px 0;
      border: 1px solid rgba(56, 189, 248, 0.12);
    }

    .builder-content .variable-highlight {
      display: inline-block;
      padding: 0 6px;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      font-size: 0.9em;
      margin: 0 2px;
    }
  `;

  const html = blocks
    .map((block) => {
      switch (block.type) {
        case 'header':
          return `<div class="builder-block builder-block-header" style="text-align:${block.align}"><h${block.level}>${escapeHtml(block.text)}</h${block.level}></div>`;
        case 'paragraph':
          return `<div class="builder-block builder-block-paragraph" style="text-align:${block.align}"><p>${escapeHtml(block.text)}</p></div>`;
        case 'compensation':
          return `<div class="builder-block builder-block-compensation"><h3>${escapeHtml(block.title)}</h3><table><tbody>${block.rows
            .map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`)
            .join('')}</tbody></table></div>`;
        case 'signature':
          return `<div class="builder-block builder-block-signature"><p>${escapeHtml(block.note)}</p><div class="signature"><p><strong>${escapeHtml(block.name)}</strong></p><p>${escapeHtml(block.title)}</p></div></div>`;
        case 'candidateSummary':
          return `<div class="builder-block candidate-summary"><h3>${escapeHtml(block.intro)}</h3><ul>${block.fields.map((field) => `<li><strong>${escapeHtml(field)}</strong></li>`).join('')}</ul></div>`;
        case 'benefits':
          return `<div class="builder-block benefits"><h3>${escapeHtml(block.title)}</h3><ul>${block.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></div>`;
        case 'cta':
          return `<div class="builder-block cta" style="text-align:${block.align}"><div class="callout"><p>${escapeHtml(block.text)}</p><p><strong>${escapeHtml(block.buttonText)}</strong></p></div></div>`;
        case 'image':
          return `<div class="builder-block image" style="text-align:center"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" style="max-width:${block.width}px; width:100%; border-radius:20px;" /></div>`;
        case 'divider':
          return `<div class="builder-block divider" style="margin:24px 0"><hr style="border-top:1px ${block.style} rgba(148,163,184,0.18);" /></div>`;
        default:
          return '';
      }
    })
    .join('');

  return `<style>${style}</style><div class="builder-page"><div class="builder-content">${html}</div></div>`;
}

export function getTemplateVariableLabels() {
  return TEMPLATE_VARIABLES.map((item) => item.key);
}

export function insertVariableIntoBlock(block: TemplateBlock, variable: string): TemplateBlock {
  const placeholder = `{{${variable}}}`;

  if (block.type === 'header' || block.type === 'paragraph') {
    return { ...block, text: `${block.text.trim()} ${placeholder}`.trim() };
  }

  if (block.type === 'signature') {
    return { ...block, note: `${block.note.trim()} ${placeholder}`.trim() };
  }

  if (block.type === 'benefits') {
    return { ...block, bullets: [...block.bullets, placeholder] };
  }

  if (block.type === 'cta') {
    return { ...block, text: `${block.text.trim()} ${placeholder}`.trim() };
  }

  return block;
}

export function getBlockSummary(block: TemplateBlock) {
  switch (block.type) {
    case 'header':
      return block.text;
    case 'paragraph':
      return block.text.slice(0, 60) + (block.text.length > 60 ? '…' : '');
    case 'compensation':
      return block.title;
    case 'signature':
      return `${block.name} — ${block.title}`;
    case 'candidateSummary':
      return block.intro;
    case 'benefits':
      return block.title;
    case 'cta':
      return block.buttonText;
    case 'image':
      return block.alt;
    case 'divider':
      return 'Section divider';
  }
}

export function buildTemplateVariablesFromContent(content: string) {
  const found = new Set<string>();
  const matcher = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  let match;

  while ((match = matcher.exec(content)) !== null) {
    found.add(match[1]);
  }

  return Array.from(found);
}
