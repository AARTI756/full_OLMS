import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/prisma/client";
import { deleteStoredFile, readStoredFile } from "@/services/storage-service";

function canReadResume(authRole: string, authId: string, candidate: { recruiterId?: string | null }) {
  if (["ADMIN", "HR", "FINANCE", "APPROVER"].includes(authRole)) {
    return true;
  }
  return authRole === "RECRUITER" && candidate.recruiterId === authId;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string; resumeId: string } | Promise<{ id: string; resumeId: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id, resumeId } = await context.params;
  const resume = await prisma.candidateResume.findUnique({ where: { id: resumeId } });

  if (!resume || resume.candidateId !== id || !resume.storagePath) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: resume.candidateId },
    select: { recruiterId: true },
  });

  if (!candidate || !canReadResume(auth.role, auth.id, candidate)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const file = await readStoredFile(resume.storagePath);
  return new Response(file.buffer, {
    status: 200,
    headers: {
      "Content-Type": resume.mimeType,
      "Content-Disposition": `attachment; filename="${resume.fileName.replace(/"/g, "\"")}"`,
      "Content-Length": String(file.size),
      "Cache-Control": "no-store",
    },
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; resumeId: string } | Promise<{ id: string; resumeId: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id, resumeId } = await context.params;
  const resume = await prisma.candidateResume.findUnique({ where: { id: resumeId } });

  if (!resume || resume.candidateId !== id || !resume.storagePath) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: resume.candidateId },
    select: { recruiterId: true },
  });

  if (!candidate || (auth.role === "RECRUITER" && candidate.recruiterId !== auth.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.candidateResume.delete({ where: { id: resumeId } });
  await deleteStoredFile(resume.storagePath);

  return NextResponse.json({ success: true });
}
