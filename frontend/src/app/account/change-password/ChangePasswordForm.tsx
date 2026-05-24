'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const MIN_LENGTH = 12;
const POLICY = {
  minLength: 'At least 12 characters',
  upper: 'One uppercase letter',
  lower: 'One lowercase letter',
  number: 'One number',
  special: 'One special character (!@#$%^&* etc.)',
};

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < MIN_LENGTH) errors.push(POLICY.minLength);
  if (!/[A-Z]/.test(password)) errors.push(POLICY.upper);
  if (!/[a-z]/.test(password)) errors.push(POLICY.lower);
  if (!/[0-9]/.test(password)) errors.push(POLICY.number);
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push(POLICY.special);
  return errors;
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    const policyErrors = validatePassword(newPassword);
    if (policyErrors.length > 0) {
      setError('New password must meet: ' + policyErrors.join(', '));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Failed to change password.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
      // Sign out so next login gets a fresh session without UPDATE_PASSWORD
      await signOut({ redirect: false });
      setTimeout(() => router.push('/?message=Password updated. Sign in with your new password.'), 1500);
    } catch {
      setError('Failed to change password.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <p className="text-green-700 font-medium">Password updated successfully.</p>
        <p className="mt-2 text-base text-slate-600">Redirecting to sign in…</p>
        <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Change password</h1>
        <p className="mt-2 text-base text-slate-600">
          Set a new password that meets the policy. You cannot skip this step.
        </p>
        <ul className="mt-2 text-sm text-slate-500 list-disc list-inside">
          <li>{POLICY.minLength}</li>
          <li>{POLICY.upper}, {POLICY.lower}, {POLICY.number}, {POLICY.special}</li>
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-base font-medium text-slate-700 mb-1">
            Current password
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="input-base w-full pr-10"
            />
            <button
              type="button"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
              onClick={() => setShowCurrent((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showCurrent ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m5.858-5.858a3 3 0 11-4.243-4.243" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="new-password" className="block text-base font-medium text-slate-700 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input-base w-full pr-10"
            />
            <button
              type="button"
              aria-label={showNew ? 'Hide password' : 'Show password'}
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showNew ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m5.858-5.858a3 3 0 11-4.243-4.243" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-base font-medium text-slate-700 mb-1">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input-base w-full"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-base text-red-700">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
      <p className="mt-4 text-center">
        <Link href="/dashboard" className="text-base font-medium text-slate-600 hover:text-slate-900">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
