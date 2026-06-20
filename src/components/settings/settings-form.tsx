'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsUpdateSchema } from '@/validators/settings';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { SettingsUpdateInput } from '@/types/settings';
import type { z } from 'zod';

type SettingsFormValues = z.infer<typeof settingsUpdateSchema>;

export function SettingsForm() {
  const { data: settings, isLoading, isError, error } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsUpdateSchema as any),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyWebsite: '',
      companyPhone: '',
      companyAddress: '',
      brandingLogoUrl: '',
      brandingPrimaryColor: '#0f172a',
      brandingSecondaryColor: '#0284c7',
      smtpHost: '',
      smtpPort: undefined,
      smtpUser: '',
      smtpFromName: '',
      smtpFromEmail: '',
      smtpSecure: true,
      smtpPassword: '',
      notificationOfferEmail: true,
      notificationCandidateEmail: true,
      notificationSystemAlerts: true,
      notificationDigestFrequency: 'daily',
      offerApprovalRequired: true,
      offerAutoRelease: false,
      automationEmailReminders: true,
      automationExpiryThresholdDays: 3,
      automationApprovalReminderHours: 24,
      automationStaleCandidateDays: 14,
      automationCleanupDays: 90,
      securityRequireStrongPassword: true,
      securityEnableTwoFactor: false,
      securitySessionTimeoutMinutes: 60,
    },
  });

  useEffect(() => {
    if (!settings) {
      return;
    }

    reset({
      companyName: settings.companyName,
      companyEmail: settings.companyEmail ?? '',
      companyWebsite: settings.companyWebsite ?? '',
      companyPhone: settings.companyPhone ?? '',
      companyAddress: settings.companyAddress ?? '',
      brandingLogoUrl: settings.brandingLogoUrl ?? '',
      brandingPrimaryColor: settings.brandingPrimaryColor ?? '#0f172a',
      brandingSecondaryColor: settings.brandingSecondaryColor ?? '#0284c7',
      smtpHost: settings.smtpHost ?? '',
      smtpPort: settings.smtpPort ?? undefined,
      smtpUser: settings.smtpUser ?? '',
      smtpFromName: settings.smtpFromName ?? '',
      smtpFromEmail: settings.smtpFromEmail ?? '',
      smtpSecure: settings.smtpSecure,
      smtpPassword: '',
      notificationOfferEmail: settings.notificationOfferEmail,
      notificationCandidateEmail: settings.notificationCandidateEmail,
      notificationSystemAlerts: settings.notificationSystemAlerts,
      notificationDigestFrequency: settings.notificationDigestFrequency,
      offerApprovalRequired: settings.offerApprovalRequired,
      offerAutoRelease: settings.offerAutoRelease,
      automationEmailReminders: settings.automationEmailReminders,
      automationExpiryThresholdDays: settings.automationExpiryThresholdDays,
      automationApprovalReminderHours: settings.automationApprovalReminderHours,
      automationStaleCandidateDays: settings.automationStaleCandidateDays,
      automationCleanupDays: settings.automationCleanupDays,
      securityRequireStrongPassword: settings.securityRequireStrongPassword,
      securityEnableTwoFactor: settings.securityEnableTwoFactor,
      securitySessionTimeoutMinutes: settings.securitySessionTimeoutMinutes,
    });
  }, [settings, reset]);

  const smtpPasswordConfigured = settings?.smtpPasswordConfigured;
  const submit = async (values: SettingsUpdateInput) => {
    try {
      await updateSettings.mutateAsync(values);
      toast({ title: 'Settings saved', description: 'Configuration changes were persisted.', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unable to persist settings.',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
        <div className="h-8 w-48 animate-pulse rounded-2xl bg-slate-800" />
        <div className="mt-6 space-y-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-12 rounded-2xl bg-slate-800/80" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[32px] border border-rose-700 bg-rose-950/80 p-8 text-slate-100 shadow-2xl shadow-rose-950/20">
        <p className="text-lg font-semibold">Unable to load settings</p>
        <p className="mt-2 text-sm text-slate-300">{error?.message ?? 'Please refresh and try again.'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <div className="mb-8 space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Company profile</p>
            <h1 className="text-3xl font-semibold text-white">System settings</h1>
            <p className="text-sm text-slate-400">Configure persisted company, branding, SMTP, workflow, and security settings for your platform.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Company name</label>
              <Input {...register('companyName')} />
              {errors.companyName && <p className="mt-2 text-sm text-rose-300">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Company email</label>
              <Input type="email" {...register('companyEmail')} />
              {errors.companyEmail && <p className="mt-2 text-sm text-rose-300">{errors.companyEmail.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Website</label>
              <Input type="url" {...register('companyWebsite')} />
              {errors.companyWebsite && <p className="mt-2 text-sm text-rose-300">{errors.companyWebsite.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Phone</label>
              <Input {...register('companyPhone')} />
              {errors.companyPhone && <p className="mt-2 text-sm text-rose-300">{errors.companyPhone.message}</p>}
            </div>
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-400">Address</label>
              <Textarea {...register('companyAddress')} rows={4} />
              {errors.companyAddress && <p className="mt-2 text-sm text-rose-300">{errors.companyAddress.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Branding</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Visual identity</h2>
          <p className="mt-4 text-sm text-slate-400">Brand assets and theme colors appear on generated documents and system notifications.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Logo URL</label>
              <Input type="url" {...register('brandingLogoUrl')} />
              {errors.brandingLogoUrl && <p className="mt-2 text-sm text-rose-300">{errors.brandingLogoUrl.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Primary color</label>
                <Input type="text" {...register('brandingPrimaryColor')} placeholder="#0f172a" />
                {errors.brandingPrimaryColor && <p className="mt-2 text-sm text-rose-300">{errors.brandingPrimaryColor.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Secondary color</label>
                <Input type="text" {...register('brandingSecondaryColor')} placeholder="#0284c7" />
                {errors.brandingSecondaryColor && <p className="mt-2 text-sm text-rose-300">{errors.brandingSecondaryColor.message}</p>}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">SMTP email</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Email delivery</h2>
          <p className="mt-4 text-sm text-slate-400">Store SMTP credentials securely and configure outgoing email settings.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">SMTP host</label>
              <Input {...register('smtpHost')} />
              {errors.smtpHost && <p className="mt-2 text-sm text-rose-300">{errors.smtpHost.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">SMTP port</label>
                <Input type="number" {...register('smtpPort', { valueAsNumber: true })} />
                {errors.smtpPort && <p className="mt-2 text-sm text-rose-300">{errors.smtpPort.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">SMTP secure</label>
                <div className="flex items-center gap-3">
                  <input type="checkbox" {...register('smtpSecure')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400 focus:ring-cyan-400" />
                  <span className="text-sm text-slate-300">Use TLS / SSL</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">SMTP user</label>
                <Input {...register('smtpUser')} />
                {errors.smtpUser && <p className="mt-2 text-sm text-rose-300">{errors.smtpUser.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">SMTP password</label>
                <Input type="password" autoComplete="new-password" {...register('smtpPassword')} />
                <p className="mt-2 text-sm text-slate-400">Leave blank to preserve the existing password. {smtpPasswordConfigured ? 'Password is configured.' : 'No SMTP password has been saved yet.'}</p>
                {errors.smtpPassword && <p className="mt-2 text-sm text-rose-300">{errors.smtpPassword.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">From name</label>
                <Input {...register('smtpFromName')} />
                {errors.smtpFromName && <p className="mt-2 text-sm text-rose-300">{errors.smtpFromName.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">From email</label>
                <Input type="email" {...register('smtpFromEmail')} />
                {errors.smtpFromEmail && <p className="mt-2 text-sm text-rose-300">{errors.smtpFromEmail.message}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Notifications</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Delivery preferences</h2>
          <p className="mt-4 text-sm text-slate-400">Choose which notifications are delivered and how frequently users receive digests.</p>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('notificationOfferEmail')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Send offer notifications by email
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('notificationCandidateEmail')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Send candidate alerts by email
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('notificationSystemAlerts')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Enable system alert notifications
            </label>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Digest frequency</label>
              <Select {...register('notificationDigestFrequency')}>
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </Select>
              {errors.notificationDigestFrequency && <p className="mt-2 text-sm text-rose-300">{errors.notificationDigestFrequency.message}</p>}
            </div>
            <div className="pt-6 border-t border-slate-800">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Automation</p>
              <div className="mt-4 space-y-4">
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input type="checkbox" {...register('automationEmailReminders')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
                  Enable automation reminders
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Expiry threshold (days)</label>
                    <Input type="number" {...register('automationExpiryThresholdDays', { valueAsNumber: true })} />
                    {errors.automationExpiryThresholdDays && <p className="mt-2 text-sm text-rose-300">{errors.automationExpiryThresholdDays.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Approval reminder interval (hours)</label>
                    <Input type="number" {...register('automationApprovalReminderHours', { valueAsNumber: true })} />
                    {errors.automationApprovalReminderHours && <p className="mt-2 text-sm text-rose-300">{errors.automationApprovalReminderHours.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Stale candidate age (days)</label>
                    <Input type="number" {...register('automationStaleCandidateDays', { valueAsNumber: true })} />
                    {errors.automationStaleCandidateDays && <p className="mt-2 text-sm text-rose-300">{errors.automationStaleCandidateDays.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Cleanup window (days)</label>
                    <Input type="number" {...register('automationCleanupDays', { valueAsNumber: true })} />
                    {errors.automationCleanupDays && <p className="mt-2 text-sm text-rose-300">{errors.automationCleanupDays.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Offer workflow</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Approval settings</h2>
          <p className="mt-4 text-sm text-slate-400">Control how offers move through approval and release stages.</p>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('offerApprovalRequired')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Require approval before release
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('offerAutoRelease')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Automatically release offers when approved
            </label>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Security</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Authentication settings</h2>
          <p className="mt-4 text-sm text-slate-400">Set platform security defaults for all users.</p>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('securityRequireStrongPassword')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Require strong passwords
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" {...register('securityEnableTwoFactor')} className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-400" />
              Enable two-factor authentication hints
            </label>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Session timeout (minutes)</label>
              <Input type="number" {...register('securitySessionTimeoutMinutes', { valueAsNumber: true })} />
              {errors.securitySessionTimeoutMinutes && <p className="mt-2 text-sm text-rose-300">{errors.securitySessionTimeoutMinutes.message}</p>}
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 rounded-[32px] border border-slate-800 bg-slate-900/90 p-6 text-slate-300 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Save configuration</p>
            <p className="mt-2 text-sm text-slate-400">Changes are persisted immediately to the database with audit tracking.</p>
          </div>
          <Button type="submit" className="rounded-3xl bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting || updateSettings.isPending}>
            {updateSettings.isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </div>
    </form>
  );
}
