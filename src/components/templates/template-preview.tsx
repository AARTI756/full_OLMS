'use client';

import { useEffect, useMemo, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { TemplatePdfDocument } from '@/components/templates/template-pdf-document';
import { renderTemplateContent, DEFAULT_TEMPLATE_PREVIEW_CONTEXT, type TemplateRenderContext } from '@/lib/template-variables';

interface TemplatePreviewProps {
  content: string;
  title?: string;
  templateId?: string;
  offerId?: string;
  context?: TemplateRenderContext;
  zoom?: number;
  customization?: {
    backgroundColor: string;
    brandColor: string;
    accentColor: string;
    textColor: string;
    fontFamily: string;
    contentPadding: number;
    pageShadow: boolean;
  };
}

export function TemplatePreview({ content, title, templateId, offerId, context, zoom = 100, customization }: TemplatePreviewProps) {
  const previewContext = context ?? DEFAULT_TEMPLATE_PREVIEW_CONTEXT;
  const fallbackRendered = useMemo(() => renderTemplateContent(content, previewContext), [content, previewContext]);
  const [rendered, setRendered] = useState(fallbackRendered);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRendered(fallbackRendered);
  }, [fallbackRendered]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    let active = true;
    setLoading(true);

    const params = new URLSearchParams();
    if (offerId) {
      params.set('offerId', offerId);
    }

    const query = params.toString() ? `?${params.toString()}` : '';

    apiFetch<{ rendered: string }>(`/api/templates/${templateId}/render${query}`)
      .then((data) => {
        if (!active) {
          return;
        }

        if (typeof data.rendered === 'string') {
          setRendered(data.rendered);
        }
      })
      .catch(() => {
        // Keep fallback content if API preview is unavailable.
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [templateId, offerId]);

  const styleVars = {
    backgroundColor: customization?.backgroundColor ?? '#ffffff',
    color: customization?.textColor ?? '#0f172a',
    fontFamily: customization?.fontFamily ?? 'Inter, ui-sans-serif, system-ui, sans-serif',
    padding: `${customization?.contentPadding ?? 32}px`,
    boxShadow: customization?.pageShadow ? '0 36px 120px rgba(15,23,42,0.26)' : '0 24px 80px rgba(15,23,42,0.16)',
  };

  return (
    <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Preview</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{title ?? 'Template preview'}</h2>
          <p className="mt-1 text-sm text-slate-400">{templateId ? 'Rendering with live template context.' : 'Rendering with sample preview values.'}</p>
        </div>
        {templateId ? (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              try {
                const blob = await pdf(
                  <TemplatePdfDocument title={title} renderedContent={rendered} context={previewContext} />
                ).toBlob();
                const filename = `${title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'offer-template'}.pdf`;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error(error);
                alert('Unable to generate the PDF preview. Please try again.');
              }
            }}
          >
            Download PDF
          </Button>
        ) : (
          <p className="text-sm text-slate-400">Save the template to enable PDF download.</p>
        )}
      </div>

      <div className="preview-shell rounded-[28px] border border-slate-800 bg-slate-950/80 p-6 shadow-inner shadow-slate-950/20">
        {loading ? (
          <div className="min-h-[260px] animate-pulse rounded-[28px] bg-slate-900/70 p-10 text-center text-sm text-slate-500">Loading document preview…</div>
        ) : (
          <div className="a4-frame flex justify-center overflow-x-auto px-4 py-6">
            <div className="a4-paper overflow-hidden rounded-[32px] bg-white p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', boxShadow: styleVars.boxShadow }}>
              <div
                className="a4-content min-h-[1040px] rounded-[28px] border border-slate-200/80 bg-white"
                style={{ backgroundColor: styleVars.backgroundColor, color: styleVars.color, fontFamily: styleVars.fontFamily, padding: styleVars.padding }}
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
