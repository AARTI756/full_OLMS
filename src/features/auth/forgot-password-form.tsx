'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { z } from 'zod';

const schema = forgotPasswordSchema;

type ForgotPasswordFormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(schema) });

  const { toast } = useToast();

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || 'Unable to process request');
        return;
      }

      setSuccess(true);
      toast({
        title: 'Check your email',
        description: 'If an account exists with this email, we have sent a password reset link.',
        variant: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process request');
    }
  }

  if (success) {
    return (
      <div className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
        <div className="rounded-3xl border border-emerald-800/60 bg-emerald-950/40 p-4">
          <p className="text-sm text-emerald-300">
            Password reset link sent
          </p>
        </div>
        <div className="space-y-4 text-slate-300">
          <p>
            We have sent a password reset link to your email address. The link will expire in 15 minutes.
          </p>
          <p className="text-sm text-slate-400">
            If you do not see the email, check your spam or junk folder. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Enter your email</h2>
        <p className="text-sm text-slate-400">We will send you a secure link to reset your password.</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Email address</label>
        <Input
          type="email"
          autoComplete="email"
          placeholder="hello@company.com"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
      </div>

      {error && <p className="rounded-3xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
      </Button>
    </form>
  );
}
