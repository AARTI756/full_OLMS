import Link from 'next/link';
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form';
import { routes } from '@/constants/routes';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Account recovery</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Enter your email address and we&apos;ll send you a link to reset your password.</p>
        </div>
        <ForgotPasswordForm />
        <div className="mt-5 flex gap-3 text-center text-sm text-slate-400">
          <Link href={routes.login} className="text-cyan-300 hover:text-cyan-200">Back to login</Link>
          <span>-</span>
          <Link href={routes.signup} className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
