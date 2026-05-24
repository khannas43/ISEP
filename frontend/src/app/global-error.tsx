'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            padding: '2rem',
            maxWidth: '28rem',
            textAlign: 'center',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '15px', lineHeight: 1.7, color: '#475569' }}>
            A critical error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '1.5rem',
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
        </div>
      </body>
    </html>
  );
}
