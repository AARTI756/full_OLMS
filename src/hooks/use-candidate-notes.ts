'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCandidateNote,
  deleteCandidateNote,
  getCandidateNotes,
  updateCandidateNote,
} from '@/services/candidate-note-service';
import type { CandidateNoteItem } from '@/types/candidate';

export function useCandidateNotes(candidateId: string) {
  const queryClient = useQueryClient();

  const notesQuery = useQuery<{ data: CandidateNoteItem[] }, Error, { data: CandidateNoteItem[] }>({
    queryKey: ['candidates', candidateId, 'notes'],
    queryFn: () => getCandidateNotes(candidateId),
    staleTime: 1000 * 60,
  });

  const createNote = useMutation<CandidateNoteItem, Error, string, { previous?: { data: CandidateNoteItem[] } }>({
    mutationFn: (content) => createCandidateNote(candidateId, content),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['candidates', candidateId, 'notes'] });
      const previous = queryClient.getQueryData<{ data: CandidateNoteItem[] }>(['candidates', candidateId, 'notes']);
      if (previous) {
        queryClient.setQueryData(['candidates', candidateId, 'notes'], {
          data: [
            {
              id: `temp-${Date.now()}`,
              content: variables,
              authorName: 'You',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...previous.data,
          ],
        });
      }
      return { previous };
    },
    onError: (_error, _variables, onMutateResult) => {
      if (onMutateResult?.previous) {
        queryClient.setQueryData(['candidates', candidateId, 'notes'], onMutateResult.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', candidateId, 'notes'] });
    },
  });

  const updateNote = useMutation<CandidateNoteItem, Error, { noteId: string; content: string }, { previous?: { data: CandidateNoteItem[] } }>({
    mutationFn: (variables) => updateCandidateNote(candidateId, variables.noteId, variables.content),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['candidates', candidateId, 'notes'] });
      const previous = queryClient.getQueryData<{ data: CandidateNoteItem[] }>(['candidates', candidateId, 'notes']);
      if (previous) {
        queryClient.setQueryData(['candidates', candidateId, 'notes'], {
          data: previous.data.map((note) =>
            note.id === variables.noteId ? { ...note, content: variables.content, updatedAt: new Date().toISOString() } : note
          ),
        });
      }
      return { previous };
    },
    onError: (_error, _variables, onMutateResult) => {
      if (onMutateResult?.previous) {
        queryClient.setQueryData(['candidates', candidateId, 'notes'], onMutateResult.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', candidateId, 'notes'] });
    },
  });

  const deleteNote = useMutation<{ success: boolean }, Error, string, { previous?: { data: CandidateNoteItem[] } }>({
    mutationFn: (noteId) => deleteCandidateNote(candidateId, noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ['candidates', candidateId, 'notes'] });
      const previous = queryClient.getQueryData<{ data: CandidateNoteItem[] }>(['candidates', candidateId, 'notes']);
      if (previous) {
        queryClient.setQueryData(['candidates', candidateId, 'notes'], {
          data: previous.data.filter((note) => note.id !== noteId),
        });
      }
      return { previous };
    },
    onError: (_error, _variables, onMutateResult) => {
      if (onMutateResult?.previous) {
        queryClient.setQueryData(['candidates', candidateId, 'notes'], onMutateResult.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', candidateId, 'notes'] });
    },
  });

  return { notesQuery, createNote, updateNote, deleteNote };
}
