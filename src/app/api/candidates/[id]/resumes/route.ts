import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/prisma/client";
import { logCandidateActivity } from "@/services/candidate-activity-logger";
import { saveUploadedFile } from "@/services/storage-service";
import { notifyResumeUploaded } from "@/services/notification-service";

const MAX_FILE_SIZE = 6 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

function canManageCandidate(authRole: string, authId: string, candidate: { recruiterId?: string | null }) {
  if (["ADMIN", "HR", "FINANCE", "APPROVER"].includes(authRole)) {
    return true;
  }
  return authRole === "RECRUITER" && candidate.recruiterId === authId;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { id: true, recruiterId: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (!canManageCandidate(auth.role, auth.id, candidate)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const resumes = await prisma.candidateResume.findMany({
    where: { candidateId: id },
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  return NextResponse.json({
    data: resumes.map((resume) => ({
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      mimeType: resume.mimeType,
      size: resume.size,
      uploadedBy: resume.uploadedBy.name,
      uploadedAt: resume.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { id: true, fullName: true, recruiterId: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (!canManageCandidate(auth.role, auth.id, candidate)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("resume");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Resume file is required" }, { status: 422 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Resume exceeds maximum file size (6MB)" }, { status: 413 });
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const storedFile = await saveUploadedFile(file);
  const resume = await prisma.candidateResume.create({
    data: {
      candidateId: id,
      uploadedById: auth.id,
      fileName: file.name,
      fileUrl: "",
      mimeType: file.type,
      size: file.size,
      storagePath: storedFile.storagePath,
    },
  });

  const fileUrl = `/api/candidates/${id}/resumes/${resume.id}`;
  await prisma.candidateResume.update({ where: { id: resume.id }, data: { fileUrl } });

  await logCandidateActivity(id, auth.id, "RESUME_UPLOADED", `Uploaded resume ${file.name}`);

  if (candidate.recruiterId) {
    await notifyResumeUploaded(candidate.recruiterId, id, candidate.fullName, file.name);
  }

  return NextResponse.json(
    {
      id: resume.id,
      fileName: resume.fileName,
      fileUrl,
      mimeType: resume.mimeType,
      size: resume.size,
      uploadedBy: auth.name,
      uploadedAt: resume.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
