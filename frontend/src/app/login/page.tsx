import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-none">
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full flex-col lg:flex-row">
            <div
              className="min-h-[40vh] flex-[1_1_58%] lg:min-h-screen"
              style={{
                background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-700) 60%, var(--navy-600) 100%)',
              }}
            />
            <div className="relative flex min-h-[60vh] flex-[1_1_42%] bg-white lg:min-h-screen">
              <div className="absolute left-4 top-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--navy-600)]" />
            </div>
          </div>
        }
      >
        <LoginForm defaultCallbackUrl="/dashboard/executive" showBackToHome layout="split" />
      </Suspense>
    </div>
  );
}
