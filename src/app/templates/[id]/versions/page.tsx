import { AppShell } from "@/components/shared/app-shell";
import { getTemplateById } from "@/services/template-service";
import { useTemplateVersions, useRestoreTemplateVersion } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface TemplateVersionsPageProps {
  params: { id: string };
}

export default async function TemplateVersionsPage({ params }: TemplateVersionsPageProps) {
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
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Version history</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{template.title}</h1>
            </div>
            <Link href={`/templates/${template.id}`}>
              <Button variant="secondary" className="rounded-3xl">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to template
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <VersionHistory clientTemplateId={template.id} />
        </div>
      </div>
    </AppShell>
  );
}

function VersionHistory({ clientTemplateId }: { clientTemplateId: string }) {
  const versionsQuery = useTemplateVersions(clientTemplateId);
  const restoreMutation = useRestoreTemplateVersion(clientTemplateId);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">Restore any previous version and keep the template audit trail intact.</p>
      {versionsQuery.isLoading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-3xl bg-slate-950/80" />
          <div className="h-24 animate-pulse rounded-3xl bg-slate-950/80" />
        </div>
      ) : (
        <div className="space-y-4">
          {versionsQuery.data?.data.map((version) => (
            <div key={version.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">Version {version.versionNumber}</p>
                <p className="text-sm text-slate-400">{version.title}</p>
                <p className="mt-2 text-sm text-slate-500">Saved {new Date(version.createdAt).toLocaleString()} by {version.createdBy}</p>
              </div>
              <Button type="button" variant="secondary" className="mt-4 rounded-3xl sm:mt-0" onClick={() => restoreMutation.mutate(version.id)}>
                <RotateCcw className="mr-2 h-4 w-4" /> Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
