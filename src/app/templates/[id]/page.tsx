import { AppShell } from "@/components/shared/app-shell";
import { TemplatePreview } from "@/components/templates/template-preview";
import { getTemplateById } from "@/services/template-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TemplatePageProps {
  params: { id: string };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const template = await getTemplateById(params.id);

  if (!template) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-300">
          <p>Template not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Template overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{template.title}</h1>
              <p className="mt-2 text-sm text-slate-400">{template.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/templates/${template.id}/edit`}>
                <Button className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">Edit</Button>
              </Link>
              <Link href={`/templates/${template.id}/versions`}>
                <Button variant="secondary" className="rounded-3xl">Version history</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_0.45fr]">
          <TemplatePreview title={template.title} content={template.content} templateId={template.id} />
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Details</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li><span className="font-semibold text-white">Category:</span> {template.category}</li>
                  <li><span className="font-semibold text-white">Status:</span> {template.isArchived ? 'Archived' : template.isActive ? 'Active' : 'Inactive'}</li>
                  <li><span className="font-semibold text-white">Created by:</span> {template.createdBy}</li>
                  <li><span className="font-semibold text-white">Updated:</span> {new Date(template.updatedAt).toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
