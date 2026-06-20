import { Suspense } from 'react';
import Link from 'next/link';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';
import { routes } from '@/constants/routes';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Account recovery</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Create a new password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Enter a strong password to regain access to your OLMS account.</p>
        </div>
        <Suspense fallback={<div className="rounded-[32px] bg-slate-950/90 p-8 text-sm text-slate-400 ring-1 ring-slate-800/60">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
        <div className="mt-5 flex gap-3 text-center text-sm text-slate-400">
          <Link href={routes.login} className="text-cyan-300 hover:text-cyan-200">Back to login</Link>
          <span>-</span>
          <Link href={routes.signup} className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
