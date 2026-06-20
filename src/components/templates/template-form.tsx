'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TemplateBuilder } from '@/components/templates/template-builder';
import { TemplatePreview } from '@/components/templates/template-preview';
import { useAutosaveTemplate } from '@/hooks/use-templates';
import { createTemplate, updateTemplate } from '@/services/template-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import type { TemplateDetail } from '@/types/template';

const templateSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1),
  content: z.string().min(1),
  isActive: z.boolean(),
  isDraft: z.boolean().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const categoryOptions = ['Offer', 'HR', 'Compensation', 'Legal', 'Onboarding'];

interface TemplateFormProps {
  initialData?: TemplateDetail;
  templateId?: string;
  submitLabel: string;
}

export function TemplateForm({ initialData, templateId, submitLabel }: TemplateFormProps) {
  const [editorContent, setEditorContent] = useState(initialData?.content ?? '<p></p>');
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      category: initialData?.category ?? 'Offer',
      content: initialData?.content ?? '<p></p>',
      isActive: initialData?.isActive ?? true,
      isDraft: initialData?.isDraft ?? false,
    },
  });

  const autosaveTemplate = useAutosaveTemplate(initialData?.id ?? '');
  const watchedValues = watch();

  useEffect(() => {
    if (!initialData?.id || autosaveTemplate.isPending) {
      return;
    }

    const timeout = window.setTimeout(() => {
      autosaveTemplate.mutate({
        title: watchedValues.title,
        description: watchedValues.description ?? null,
        category: watchedValues.category,
        content: watchedValues.content,
        isActive: watchedValues.isActive,
        isDraft: watchedValues.isDraft,
      });
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [autosaveTemplate, initialData?.id, watchedValues]);

  const submit = async (values: TemplateFormValues, saveAsDraft = false) => {
    try {
      const payload = { ...values, isDraft: saveAsDraft };
      const result = templateId
        ? await updateTemplate(templateId, payload)
        : await createTemplate(payload);

      toast({
        title: saveAsDraft ? 'Draft saved' : 'Template saved',
        description: saveAsDraft ? 'Your draft will be available for later editing.' : 'Template changes were persisted.',
        variant: 'success',
      });

      if (templateId) {
        router.push(`/templates/${templateId}`);
      } else if (result?.id) {
        router.push(`/templates/${result.id}/edit`);
      }
    } catch (error) {
      toast({ title: 'Unable to save template', description: `${error instanceof Error ? error.message : 'Please try again.'}`, variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit((values) => submit(values))} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Template title</label>
          <Input {...register('title')} placeholder="Executive offer letter" />
          {errors.title && <p className="mt-2 text-sm text-rose-300">{errors.title.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Category</label>
          <Select {...register('category')}>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          {errors.category && <p className="mt-2 text-sm text-rose-300">{errors.category.message}</p>}
        </div>
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-400">Description</label>
          <Textarea {...register('description')} rows={3} placeholder="A short summary of the template purpose." />
          {errors.description && <p className="mt-2 text-sm text-rose-300">{errors.description.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <TemplateBuilder
          content={editorContent}
          onChange={(value) => {
            setEditorContent(value);
            setValue('content', value);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" className="rounded-3xl bg-slate-800 text-white hover:bg-slate-700" disabled={isSubmitting} onClick={handleSubmit((values) => submit(values, true))}>
          Save draft
        </Button>
        <Button type="submit" className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting}>{submitLabel}</Button>
        <span className="text-sm text-slate-400">Use placeholders like <code className="rounded-md bg-slate-950 px-2 py-1 text-xs text-cyan-300">{"{{candidateName}}"}</code>.</span>
      </div>
    </form>
  );
}
