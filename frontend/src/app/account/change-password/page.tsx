import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ChangePasswordForm } from './ChangePasswordForm';

/**
 * SCR-AUTH-03 — Forced Password Change.
 * Shown to new users on first login or when Admin resets a password.
 * All roles can access. Cannot skip when required (enforced via redirect in login flow).
 */
export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/?callbackUrl=' + encodeURIComponent('/account/change-password'));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
