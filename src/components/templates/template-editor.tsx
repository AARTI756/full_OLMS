'use client';

import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import { TemplateToolbar } from '@/components/templates/template-toolbar';

interface TemplateEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function TemplateEditor({ content, onChange }: TemplateEditorProps) {
  const [isFullWidth, setIsFullWidth] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Write your template content here…' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[320px] w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40',
      },
    },
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Template editor</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Design your template content</h2>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-800 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:border-cyan-400/70 hover:bg-slate-900"
          onClick={() => setIsFullWidth((state) => !state)}
        >
          {isFullWidth ? 'Compact editor' : 'Full width editor'}
        </button>
      </div>

      <TemplateToolbar editor={editor} />

      <div className={isFullWidth ? 'w-full' : 'max-w-5xl'}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
