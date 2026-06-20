'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { useCandidateNotes } from '@/hooks/use-candidate-notes';
import { CandidateNoteCard } from '@/components/candidates/candidate-note-card';
import type { CandidateNoteItem } from '@/types/candidate';

interface CandidateNotesPanelProps {
  candidateId: string;
}

export function CandidateNotesPanel({ candidateId }: CandidateNotesPanelProps) {
  const { notesQuery, createNote, updateNote, deleteNote } = useCandidateNotes(candidateId);
  const [draft, setDraft] = useState('');
  const [editingNote, setEditingNote] = useState<CandidateNoteItem | null>(null);
  const { toast } = useToast();

  const notes = notesQuery.data?.data ?? [];

  const isBusy =
    createNote.status === 'pending' ||
    updateNote.status === 'pending' ||
    deleteNote.status === 'pending';

  const title = editingNote ? 'Update note' : 'Add note';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) {
      toast({ title: 'Empty note', description: 'Please enter note content before saving.', variant: 'warning' });
      return;
    }

    try {
      if (editingNote) {
        await updateNote.mutateAsync({ noteId: editingNote.id, content });
        toast({ title: 'Note updated', description: 'Your note has been saved.', variant: 'success' });
      } else {
        await createNote.mutateAsync(content);
        toast({ title: 'Note added', description: 'New candidate note created.', variant: 'success' });
      }
      setDraft('');
      setEditingNote(null);
    } catch {
      toast({ title: 'Unable to save note', description: 'Check your connection and try again.', variant: 'error' });
    }
  }

  function handleEdit(note: CandidateNoteItem) {
    setEditingNote(note);
    setDraft(note.content);
  }

  async function handleDelete(noteId: string) {
    if (!window.confirm('Delete this note? This cannot be undone.')) {
      return;
    }
    try {
      await deleteNote.mutateAsync(noteId);
      toast({ title: 'Note deleted', description: 'The note was removed.', variant: 'success' });
    } catch {
      toast({ title: 'Unable to delete note', description: 'Please try again later.', variant: 'error' });
    }
  }

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Candidate notes</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Conversations and feedback</h2>
        </div>
        <p className="text-sm text-slate-400">Track annotations, comments, and hiring context in one secure timeline.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">{title}</label>
          <Textarea
            rows={4}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a note for the candidate..."
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isBusy}>{editingNote ? 'Update note' : 'Add note'}</Button>
          {editingNote ? (
            <Button type="button" variant="secondary" onClick={() => { setEditingNote(null); setDraft(''); }}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {notes.length ? (
          notes.map((note) => (
            <CandidateNoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
            <p>No notes have been added for this candidate yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
