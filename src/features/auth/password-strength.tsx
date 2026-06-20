export type PasswordStrength = {
  score: number;
  label: "Weak" | "Medium" | "Strong";
  color: string;
};

// Shared with signup and reset password so both forms explain strength the same way.
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z\d]/.test(password)) score += 2;

  if (score >= 7) {
    return { score, label: "Strong", color: "bg-emerald-500/80" };
  }

  if (score >= 4) {
    return { score, label: "Medium", color: "bg-amber-500/80" };
  }

  return { score, label: "Weak", color: "bg-rose-500/80" };
}

export function PasswordStrengthMeter({ password }: { password?: string }) {
  if (!password) {
    return null;
  }

  const strength = calculatePasswordStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${Math.min(strength.score * 12.5, 100)}%` }}
          />
        </div>
        <span className="min-w-[50px] text-xs font-medium text-slate-300">
          {strength.label}
        </span>
      </div>
    </div>
  );
}
