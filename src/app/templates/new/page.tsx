import { AppShell } from "@/components/shared/app-shell";
import { TemplateForm } from "@/components/templates/template-form";

export default function NewTemplatePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">New template</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Create a reusable template</h1>
          </div>
        </div>
        <TemplateForm
          submitLabel="Create template"
        />
      </div>
    </AppShell>
  );
}
