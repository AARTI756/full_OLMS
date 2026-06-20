import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { candidateBulkDeleteSchema, candidateCreateSchema, candidateListSchema } from "@/validators/candidates";
import { createCandidate, deleteCandidates, getCandidateList } from "@/services/candidate-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request.url);
  const parsed = candidateListSchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    department: url.searchParams.get("department") ?? undefined,
    recruiter: url.searchParams.get("recruiter") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortOrder: url.searchParams.get("sortOrder") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = await getCandidateList(parsed.data);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const parsed = candidateCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid candidate payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const created = await createCandidate({
    ...parsed.data,
    skills: parsed.data.skills ? parsed.data.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
    createdById: auth.id,
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const parsed = candidateBulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const result = await deleteCandidates(parsed.data.ids);
  return NextResponse.json({ deleted: result.count });
}
