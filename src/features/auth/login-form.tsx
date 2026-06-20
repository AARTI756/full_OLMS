'use client';

import Link from 'next/link';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAccessToken } from "@/lib/auth-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/use-auth-store";
import { routes } from "@/constants/routes";
import { z } from "zod";

const schema = loginSchema;

type LoginFormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  const setUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json().catch(() => ({ error: "Unable to sign in" }));

      if (!response.ok) {
        setError(payload?.error || "Unable to sign in");
        return;
      }

      setAccessToken(payload.accessToken);
      setUser(payload.user);
      toast({
        title: "Signed in successfully",
        description: "Welcome back to OLMS.",
        variant: "success",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Sign in to OLMS</h1>
        <p className="text-sm text-slate-400">Enter your credentials to access the HRMS offer management platform.</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Email</label>
        <Input type="email" autoComplete="email" placeholder="hello@company.com" {...register("email")} />
        {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Password</label>
        <Input type="password" autoComplete="current-password" placeholder="********" {...register("password")} />
        {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
      </div>

      <div className="flex justify-end">
        <Link href={routes.forgotPassword} className="text-sm text-cyan-300 hover:text-cyan-200">
          Forgot password?
        </Link>
      </div>

      {error && <p className="rounded-3xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
