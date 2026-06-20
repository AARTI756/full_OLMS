'use client';

import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateResumeUploader } from '@/components/candidates/candidate-resume-uploader';
import { useCandidateResumes } from '@/hooks/use-candidate-resumes';
import { useToast } from '@/components/ui/toast';
import { downloadResume } from '@/services/candidate-resume-service';

interface CandidateResumesPanelProps {
  candidateId: string;
}

export function CandidateResumesPanel({ candidateId }: CandidateResumesPanelProps) {
  const { resumesQuery, deleteResume } = useCandidateResumes(candidateId);
  const { toast } = useToast();

  const resumes = resumesQuery.data?.data ?? [];
  const isLoading = resumesQuery.isLoading;

  async function handleDelete(resumeId: string) {
    if (!window.confirm('Remove this resume permanently?')) return;
    try {
      await deleteResume.mutateAsync(resumeId);
      toast({ title: 'Resume removed', description: 'The resume has been deleted.', variant: 'success' });
    } catch {
      toast({ title: 'Unable to delete', description: 'Please try again later.', variant: 'error' });
    }
  }

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Resume management</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Candidate documents</h2>
        </div>
        <p className="text-sm text-slate-400">Upload and manage resumes for the candidate in a secure local folder.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_0.7fr]">
        <CandidateResumeUploader candidateId={candidateId} onUploadSuccess={() => resumesQuery.refetch()} />
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Resume library</h3>
          <div className="mt-5 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-950/80" />
              ))
            ) : resumes.length ? (
              resumes.map((resume) => (
                <div key={resume.id} className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{resume.fileName}</p>
                    <p className="text-sm text-slate-400">Uploaded by {resume.uploadedBy} · {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="secondary" onClick={() => downloadResume(resume.fileUrl)}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button type="button" variant="ghost" className="text-rose-300 hover:text-rose-100" onClick={() => handleDelete(resume.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
                No resumes uploaded yet. Use the uploader to add candidate files.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
