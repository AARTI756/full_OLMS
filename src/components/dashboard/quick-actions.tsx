import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText, Download } from "lucide-react";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Workflow shortcuts</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Launch hiring momentum</h3>
        </div>
        <Button variant="secondary" onClick={() => router.push('/offers')}>
          Review offers
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Button
          variant="ghost"
          className="justify-start gap-3 rounded-[24px] bg-slate-900/85 px-5 py-4 text-left text-slate-100 hover:bg-slate-800/90"
          onClick={() => router.push('/offers/new')}
        >
          <Plus className="h-5 w-5 text-cyan-300" />
          Create offer
        </Button>
        <Button
          variant="ghost"
          className="justify-start gap-3 rounded-[24px] bg-slate-900/85 px-5 py-4 text-left text-slate-100 hover:bg-slate-800/90"
          onClick={() => router.push('/templates/new')}
        >
          <Upload className="h-5 w-5 text-cyan-300" />
          Upload template
        </Button>
        <Button
          variant="ghost"
          className="justify-start gap-3 rounded-[24px] bg-slate-900/85 px-5 py-4 text-left text-slate-100 hover:bg-slate-800/90"
          onClick={() => router.push('/candidates/new')}
        >
          <FileText className="h-5 w-5 text-cyan-300" />
          Add candidate
        </Button>
        <Button
          variant="ghost"
          className="justify-start gap-3 rounded-[24px] bg-slate-900/85 px-5 py-4 text-left text-slate-100 hover:bg-slate-800/90"
          onClick={() => window.open('/api/reports/export?type=offers', '_blank')}
        >
          <Download className="h-5 w-5 text-cyan-300" />
          Export data
        </Button>
      </div>
    </div>
  );
}
