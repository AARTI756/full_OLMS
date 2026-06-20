'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAccessToken } from "@/lib/auth-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/use-auth-store";
import { z } from "zod";

const schema = signupSchema;

type SignupFormValues = z.infer<typeof schema>;

// Calculate password strength
function calculatePasswordStrength(password: string): {
  score: number;
  label: "Weak" | "Medium" | "Strong";
  color: string;
} {
  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z\d]/.test(password)) score += 2;

  // Determine label and color based on score
  if (score >= 7) {
    return { score, label: "Strong", color: "bg-emerald-500/80" };
  } else if (score >= 4) {
    return { score, label: "Medium", color: "bg-amber-500/80" };
  }
  return { score, label: "Weak", color: "bg-rose-500/80" };
}

// Eye icon component
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<SignupFormValues>({ resolver: zodResolver(schema) });

  // Watch password field for strength indicator
  const password = useWatch({
    control,
    name: "password",
  });

  const passwordStrength = useMemo(
    () => (password ? calculatePasswordStrength(password) : null),
    [password]
  );

  const setUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  async function onSubmit(values: SignupFormValues) {
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to create account");
      return;
    }

    const payload = await response.json();
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    toast({
      title: "Account created",
      description: "Your OLMS account is ready to use.",
      variant: "success",
    });
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Create your account</h1>
        <p className="text-sm text-slate-400">Register a secure HRMS account and begin managing offers, candidates, and approvals.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Full name</label>
          <Input placeholder="Avery Chen" {...register("name")} />
          {errors.name && <p className="text-sm text-rose-400">{errors.name.message}</p>}
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Phone</label>
          <Input type="tel" placeholder="(555) 123-4567" {...register("phone")} />
          {errors.phone && <p className="text-sm text-rose-400">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Email</label>
        <Input type="email" autoComplete="email" placeholder="hello@company.com" {...register("email")} />
        {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength?.color} transition-all duration-300`}
                  style={{
                    width: `${Math.min((passwordStrength?.score ?? 0) * 12.5, 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300 min-w-[50px]">
                {passwordStrength?.label}
              </span>
            </div>
          </div>
        )}

        {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <EyeIcon open={showConfirmPassword} />
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>}
      </div>

      {error && <p className="rounded-3xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
