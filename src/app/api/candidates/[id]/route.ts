import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { deleteCandidate, getCandidateById, updateCandidate } from "@/services/candidate-service";
import { candidateCreateSchema } from "@/validators/candidates";
import { logCandidateActivity } from "@/services/candidate-activity-logger";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
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
  const parsed = candidateCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid candidate payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await updateCandidate(id, {
    ...parsed.data,
    skills: parsed.data.skills ? parsed.data.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
    updatedById: auth.id,
  });

  await logCandidateActivity(id, auth.id, "UPDATED", `Updated candidate ${updated.fullName}`);

  return NextResponse.json({ id: updated.id });
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
  const candidate = await getCandidateById(id);
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  await deleteCandidate(id);
  await logCandidateActivity(id, auth.id, "DELETED", `Deleted candidate ${candidate.fullName}`);

  return NextResponse.json({ success: true });
}
