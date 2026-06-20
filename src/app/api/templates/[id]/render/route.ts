import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getTemplateById } from "@/services/template-service";
import { getOfferById } from "@/services/offer-service";
import { getSettings } from "@/services/settings-service";
import type { TemplateRenderContext } from "@/lib/template-variables";
import {
  buildTemplateRenderContextFromOffer,
  DEFAULT_TEMPLATE_PREVIEW_CONTEXT,
  renderTemplateContent,
} from "@/lib/template-variables";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const template = await getTemplateById(id);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const offerId = url.searchParams.get("offerId");

  const settings = await getSettings();
  const companyName = settings.companyName || DEFAULT_TEMPLATE_PREVIEW_CONTEXT.companyName;
  let renderContext: TemplateRenderContext = { ...DEFAULT_TEMPLATE_PREVIEW_CONTEXT, companyName };

  if (offerId) {
    const offer = await getOfferById(offerId);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    renderContext = buildTemplateRenderContextFromOffer(offer, companyName);
  }

  const rendered = renderTemplateContent(template.content, renderContext);
  return NextResponse.json({ rendered });
}
