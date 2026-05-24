'use client';

import { useEffect } from 'react';

export default function ErrorBoundaryUI({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '28rem',
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '15px', lineHeight: 1.7, color: '#475569' }}>
          An error occurred. You can try again or return to the home page.
        </p>
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '0.625rem 1rem',
              fontSize: '15px',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.625rem 1rem',
              fontSize: '15px',
              fontWeight: 500,
              color: '#334155',
              backgroundColor: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Home
          </a>
        </div>
      </div>
    </main>
  );
}
