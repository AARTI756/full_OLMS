import { chromium, type Browser } from "playwright";
import { getTemplateById } from "@/services/template-service";
import { getOfferById } from "@/services/offer-service";
import { getSettings } from "@/services/settings-service";
import type { TemplateRenderContext } from "@/lib/template-variables";
import {
  buildTemplateRenderContextFromOffer,
  DEFAULT_TEMPLATE_PREVIEW_CONTEXT,
  renderTemplateContent,
} from "@/lib/template-variables";
import { buildTemplatePdfHtml, getTemplatePdfFileName } from "@/lib/pdf";

let browserInstance: Browser | null = null;

async function getBrowser() {
  if (browserInstance) {
    return browserInstance;
  }

  browserInstance = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  return browserInstance;
}

export type GenerateTemplatePdfOptions = {
  offerId?: string;
};

export async function renderHtmlToPdf(html: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "24mm", bottom: "24mm", left: "24mm", right: "24mm" },
    });
  } finally {
    await page.close();
  }
}

export async function generateTemplatePdf(templateId: string, options: GenerateTemplatePdfOptions = {}) {
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error("Template not found.");
  }

  const settings = await getSettings();
  const companyName = settings.companyName || DEFAULT_TEMPLATE_PREVIEW_CONTEXT.companyName;
  let renderContext: TemplateRenderContext = { ...DEFAULT_TEMPLATE_PREVIEW_CONTEXT, companyName };

  if (options.offerId) {
    const offer = await getOfferById(options.offerId);
    if (!offer) {
      throw new Error("Offer not found.");
    }
    renderContext = buildTemplateRenderContextFromOffer(offer, companyName);
  }

  const renderedHtml = renderTemplateContent(template.content, renderContext);
  const documentHtml = buildTemplatePdfHtml(renderedHtml, renderContext, template.title);
  const pdfBuffer = await renderHtmlToPdf(documentHtml);

  return {
    buffer: pdfBuffer,
    fileName: getTemplatePdfFileName(template.title),
  };
}
