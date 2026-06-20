import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { templateCreateSchema, templateListSchema } from "@/validators/templates";
import { createTemplate, getTemplateList } from "@/services/template-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request.url);
  const parsed = templateListSchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortOrder: url.searchParams.get("sortOrder") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = await getTemplateList(parsed.data);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const parsed = templateCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const template = await createTemplate({
    ...parsed.data,
    createdById: auth.id,
  });

  return NextResponse.json({ id: template.id }, { status: 201 });
}
