import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { templatePatchSchema, templateUpdateSchema } from "@/validators/templates";
import { getTemplateById, updateTemplate, archiveTemplate } from "@/services/template-service";

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

  return NextResponse.json(template);
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = templateUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const template = await updateTemplate(id, {
    ...parsed.data,
    isActive: parsed.data.isActive ?? true,
    updatedById: auth.id,
  });
  return NextResponse.json({ id: template.id });
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = templatePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const template = await updateTemplate(id, {
    title: parsed.data.title ?? (await getTemplateById(id))?.title ?? '',
    description: parsed.data.description ?? (await getTemplateById(id))?.description ?? null,
    category: parsed.data.category ?? (await getTemplateById(id))?.category ?? 'Offer',
    content: parsed.data.content ?? (await getTemplateById(id))?.content ?? '',
    isActive: parsed.data.isActive ?? true,
    isDraft: parsed.data.isDraft ?? false,
    updatedById: auth.id,
  });

  return NextResponse.json({ id: template.id });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  await archiveTemplate(id);
  return NextResponse.json({ id });
}
