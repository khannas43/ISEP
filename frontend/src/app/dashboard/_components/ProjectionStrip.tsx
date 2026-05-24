'use client';

interface Props {
  meetingCode: string | null;
  text: string | null;
  loading: boolean;
}

export function ProjectionStrip({ meetingCode, text, loading }: Props) {
  if (loading && !text) {
    return <div className="h-14 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base dark:border-gray-700 dark:bg-gray-800/80">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="mt-0.5 h-6 w-6 shrink-0 text-gray-600 dark:text-gray-300"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
      <p className="leading-relaxed text-gray-700 dark:text-gray-200">
        <span className="font-semibold text-gray-900 dark:text-white">
          AI Projection{meetingCode ? ` · ${meetingCode}` : ''}:
        </span>{' '}
        {text ? <span>{text}</span> : <span className="text-gray-500">No projection available.</span>}
      </p>
    </div>
  );
}
