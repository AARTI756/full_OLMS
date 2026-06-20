import { AppShell } from "@/components/shared/app-shell";
import { TemplateForm } from "@/components/templates/template-form";
import { getTemplateById } from "@/services/template-service";

interface TemplateEditPageProps {
  params: { id: string };
}

export default async function TemplateEditPage({ params }: TemplateEditPageProps) {
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
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Edit template</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{template.title}</h1>
          </div>
        </div>
        <TemplateForm
          initialData={template}
          templateId={template.id}
          submitLabel="Save changes"
        />
      </div>
    </AppShell>
  );
}
