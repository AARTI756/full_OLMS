'use client';

import type { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Table, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateToolbarProps {
  editor: Editor | null;
}

function ToolbarButton({ active, title, onClick, icon: Icon }: {
  active: boolean;
  title: string;
  onClick: () => void;
  icon: typeof Bold;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      className="h-11 w-11 rounded-2xl p-0"
      onClick={onClick}
      aria-label={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function TemplateToolbar({ editor }: TemplateToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-3xl border border-slate-800 bg-slate-950/80 p-3">
      <ToolbarButton
        title="Heading"
        icon={Type}
        active={editor.isActive('heading')}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        title="Bold"
        icon={Bold}
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        title="Italic"
        icon={Italic}
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        title="Underline"
        icon={Underline}
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        title="Bullet list"
        icon={List}
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        title="Numbered list"
        icon={ListOrdered}
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        title="Quote"
        icon={Quote}
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        title="Insert table"
        icon={Table}
        active={false}
        onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 3, withHeaderRow: true }).run()}
      />
    </div>
  );
}
