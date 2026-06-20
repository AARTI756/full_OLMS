'use client';

import { useRef, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface CandidateResumeUploaderProps {
  candidateId: string;
  onUploadSuccess: () => void;
}

const allowedExtensions = ['pdf', 'doc', 'docx'];
const maxFileSize = 6 * 1024 * 1024;

export function CandidateResumeUploader({ candidateId, onUploadSuccess }: CandidateResumeUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  function handleFile(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowedExtensions.includes(extension)) {
      toast({ title: 'Invalid file format', description: 'Upload PDF, DOC, or DOCX only.', variant: 'error' });
      return;
    }

    if (file.size > maxFileSize) {
      toast({ title: 'File too large', description: 'Resume must be smaller than 6MB.', variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    const token = window.localStorage.getItem('olms_access_token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/candidates/${candidateId}/resumes`);
    xhr.withCredentials = true;
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.onload = () => {
      setIsUploading(false);
      setProgress(0);
      if (xhr.status === 201) {
        toast({ title: 'Resume uploaded', description: 'Candidate resume uploaded successfully.', variant: 'success' });
        onUploadSuccess();
      } else {
        const response = JSON.parse(xhr.responseText || '{}');
        toast({ title: 'Upload failed', description: response.error || 'Unable to upload resume.', variant: 'error' });
      }
    };
    xhr.onerror = () => {
      setIsUploading(false);
      setProgress(0);
      toast({ title: 'Upload failed', description: 'Network error while uploading resume.', variant: 'error' });
    };
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    setIsUploading(true);
    xhr.send(formData);
  }

  return (
    <div>
      <div
        className={cn(
          'group relative flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-700 bg-slate-950/80 p-6 text-center transition hover:border-cyan-400/60 hover:bg-slate-900/90',
          isDragging && 'border-cyan-400/70 bg-slate-900/90'
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 transition group-hover:bg-cyan-500/20">
          <UploadCloud className="h-7 w-7" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Upload resume</p>
          <p className="mt-2 text-sm text-slate-400">Drop a resume file or browse to upload candidate documents.</p>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            Browse files
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handleFile(file);
            }
          }}
        />
      </div>

      {isUploading ? (
        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Uploading resume</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
