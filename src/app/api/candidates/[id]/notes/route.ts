import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { candidateNoteSchema } from "@/validators/candidates";
import { prisma } from "@/prisma/client";
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
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const notes = await prisma.candidateNote.findMany({
    where: { candidateId: id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({
    data: notes.map((note) => ({
      id: note.id,
      content: note.content,
      authorName: note.author.name,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
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
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = candidateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const note = await prisma.candidateNote.create({
    data: {
      content: parsed.data.content,
      candidateId: id,
      authorId: auth.id,
    },
    include: { author: { select: { name: true } } },
  });

  await logCandidateActivity(id, auth.id, "NOTE_ADDED", `Added a note for candidate ${candidate.fullName}`);

  return NextResponse.json({
    id: note.id,
    content: note.content,
    authorName: note.author.name,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }, { status: 201 });
}
