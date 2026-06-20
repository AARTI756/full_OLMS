import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { candidateNoteSchema } from "@/validators/candidates";
import { prisma } from "@/prisma/client";
import { logCandidateActivity } from "@/services/candidate-activity-logger";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string; noteId: string } | Promise<{ id: string; noteId: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id, noteId } = await context.params;
  const note = await prisma.candidateNote.findUnique({ where: { id: noteId } });
  if (!note || note.candidateId !== id) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = candidateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note payload", details: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await prisma.candidateNote.update({
    where: { id: noteId },
    data: { content: parsed.data.content },
    include: { author: { select: { name: true } } },
  });

  await logCandidateActivity(id, auth.id, "NOTE_UPDATED", `Updated a note for candidate ${id}`);

  return NextResponse.json({
    id: updated.id,
    content: updated.content,
    authorName: updated.author.name,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; noteId: string } | Promise<{ id: string; noteId: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id, noteId } = await context.params;
  const note = await prisma.candidateNote.findUnique({ where: { id: noteId } });
  if (!note || note.candidateId !== id) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.candidateNote.delete({ where: { id: noteId } });
  await logCandidateActivity(id, auth.id, "NOTE_DELETED", `Deleted a note for candidate ${id}`);

  return NextResponse.json({ success: true });
}
