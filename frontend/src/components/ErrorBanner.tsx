'use client';

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800"
      role="alert"
    >
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="font-medium text-red-900 underline hover:no-underline">
          Retry
        </button>
      ) : null}
    </div>
  );
}
