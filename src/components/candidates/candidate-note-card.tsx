'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CandidateNoteItem } from '@/types/candidate';

interface CandidateNoteCardProps {
  note: CandidateNoteItem;
  onEdit: (note: CandidateNoteItem) => void;
  onDelete: (noteId: string) => void;
}

export function CandidateNoteCard({ note, onEdit, onDelete }: CandidateNoteCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5 shadow-inner shadow-slate-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{note.authorName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" className="rounded-3xl px-3 py-2" onClick={() => onEdit(note)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="rounded-3xl px-3 py-2 text-rose-300 hover:text-rose-100" onClick={() => onDelete(note.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{note.content}</p>
      {note.updatedAt !== note.createdAt ? (
        <p className="mt-3 text-xs text-slate-500">Updated {new Date(note.updatedAt).toLocaleString()}</p>
      ) : null}
    </article>
  );
}
