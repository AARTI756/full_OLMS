import Link from "next/link";
import { SignupForm } from "@/features/auth/signup-form";
import { routes } from "@/constants/routes";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Start your team</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Create a new account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Register your HR team to manage candidates, templates, and approvals in one polished dashboard.</p>
        </div>
        <SignupForm />
        <p className="mt-5 text-center text-sm text-slate-400">
          Already have an account? <Link href={routes.login} className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
