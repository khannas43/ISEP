import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          </div>
        }
      >
        <LoginForm defaultCallbackUrl="/dashboard" showBackToHome={true} />
      </Suspense>
    </main>
  );
}
