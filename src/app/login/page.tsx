import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { routes } from "@/constants/routes";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Secure access</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Sign in to continue managing offers, candidates, and approvals across your team.</p>
        </div>
        <LoginForm />
        <p className="mt-5 text-center text-sm text-slate-400">
          New to OLMS? <Link href={routes.signup} className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
