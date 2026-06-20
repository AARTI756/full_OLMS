'use client';

import { AppShell } from '@/components/shared/app-shell';
import { SettingsForm } from '@/components/settings/settings-form';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Admin settings</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">System configuration</h1>
              <p className="mt-2 text-sm text-slate-400">Manage company profile, branding, SMTP, notifications, workflow, and security settings.</p>
            </div>
          </div>
        </div>
        <SettingsForm />
      </div>
    </AppShell>
  );
}
