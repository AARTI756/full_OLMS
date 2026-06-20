import type { TemplateRenderContext } from "@/lib/template-variables";

export function getTemplatePdfFileName(title?: string) {
  const normalizedTitle = title?.trim() ?? "";
  const filename = normalizedTitle
    ? normalizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "document";

  return `offer-template-${filename || "document"}.pdf`;
}

export function buildTemplatePdfHtml(
  content: string,
  context: TemplateRenderContext,
  title = "Offer document"
) {
  const safeTitle = title.replace(/[<>]/g, "");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      @page {
        size: A4;
        margin: 24mm;
      }

      html,
      body {
        width: 210mm;
        min-height: 297mm;
        margin: 0;
        padding: 0;
        background: #fff;
        color: #111827;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }

      * {
        box-sizing: border-box;
      }

      body {
        padding: 0;
      }

      .document-shell {
        width: 100%;
        padding: 24mm;
      }

      .pdf-header {
        margin-bottom: 30px;
      }

      .pdf-title {
        margin: 0;
        color: #0f172a;
        font-size: 28px;
        font-weight: 800;
      }

      .pdf-subtitle {
        margin: 12px 0 0;
        color: #475569;
        font-size: 14px;
      }

      .content {
        font-size: 12pt;
        color: #1f2937;
      }

      .content p,
      .content li,
      .content th,
      .content td {
        color: #374151;
      }

      .content table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }

      .content th,
      .content td {
        border: 1px solid #d1d5db;
        padding: 10px 12px;
        vertical-align: top;
      }

      .content th {
        background: #f8fafc;
        font-weight: 700;
        text-align: left;
      }

      .content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 18px 0;
      }

      .signature {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin-top: 32px;
      }

      .signature-block {
        min-width: 180px;
      }

      .signature-line {
        display: inline-block;
        width: 240px;
        border-bottom: 1px solid #64748b;
        margin-bottom: 8px;
      }

      .signature-label {
        font-size: 11pt;
        color: #475569;
      }

      .divider {
        height: 1px;
        margin: 24px 0;
        background: #e2e8f0;
        border: none;
      }

      ul,
      ol {
        margin: 0 0 1rem 1.25rem;
        padding: 0;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: #0f172a;
        margin: 1.6rem 0 0.6rem;
      }

      h1 {
        font-size: 26px;
      }

      h2 {
        font-size: 20px;
      }

      .page-break {
        page-break-after: always;
      }
    </style>
  </head>
  <body>
    <div class="document-shell">
      <header class="pdf-header">
        <h1 class="pdf-title">${safeTitle}</h1>
        <p class="pdf-subtitle">Generated as an A4 offer template output for download or email attachment.</p>
      </header>
      <article class="content">
        ${content}
      </article>
    </div>
  </body>
</html>`;
}
