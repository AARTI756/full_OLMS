'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TEMPLATE_VARIABLES } from '@/lib/template-variables';

interface TemplateVariablePickerProps {
  onInsert: (variable: string) => void;
}

export function TemplateVariablePicker({ onInsert }: TemplateVariablePickerProps) {
  const variables = useMemo(() => TEMPLATE_VARIABLES, []);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Variables</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Insert placeholders</h3>
        </div>
        <p className="text-sm text-slate-400">Use tokens inside your template body.</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {variables.map((variable) => (
          <Button
            key={variable.key}
            type="button"
            variant="outline"
            className="rounded-3xl px-3 py-2 text-sm"
            onClick={() => onInsert(`{{${variable.key}}}`)}
          >
            {variable.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
