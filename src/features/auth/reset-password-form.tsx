'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { resetPasswordSchema } from '@/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { PasswordStrengthMeter } from '@/features/auth/password-strength';

const schema = resetPasswordSchema;

type ResetPasswordFormValues = z.infer<typeof schema>;

export function ResetPasswordForm({ initialToken }: { initialToken?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = initialToken ?? searchParams.get('token') ?? '';

  const [error, setError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control, name: 'password' });

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        setIsTokenValid(response.ok);
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsCheckingToken(false);
      }
    }

    checkToken();
  }, [token]);

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: values.token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 400 && payload.error?.toLowerCase().includes('expired')) {
          setIsTokenValid(false);
          setError('This reset link has expired. Please request a new one.');
          return;
        }

        setError(payload?.error || 'Unable to reset password');
        return;
      }

      toast({
        title: 'Password updated successfully',
        description: 'You can now sign in with your new password.',
        variant: 'success',
      });

      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    }
  }

  if (isCheckingToken) {
    return (
      <div className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Checking reset link</h2>
          <p className="text-sm text-slate-400">Please wait while OLMS verifies your secure password reset link.</p>
        </div>
      </div>
    );
  }

  if (!token || !isTokenValid) {
    return (
      <div className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
        <div className="rounded-3xl border border-rose-800/60 bg-rose-950/40 p-4">
          <p className="text-sm text-rose-300">Invalid or expired reset link</p>
        </div>
        <div className="space-y-4 text-slate-300">
          <p>This password reset link is missing, invalid, expired, or already used.</p>
          <Button type="button" onClick={() => router.push('/forgot-password')} className="w-full">
            Request a new reset link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[32px] bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-800/60">
      <input type="hidden" {...register('token')} />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Set a new password</h2>
        <p className="text-sm text-slate-400">Create a strong password for your OLMS account.</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">New password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            autoComplete="new-password"
            className="pr-12"
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <PasswordStrengthMeter password={password} />
        {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Confirm password</label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="********"
            autoComplete="new-password"
            className="pr-12"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>}
      </div>

      {error && <p className="rounded-3xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Resetting password...' : 'Reset password'}
      </Button>
    </form>
  );
}
