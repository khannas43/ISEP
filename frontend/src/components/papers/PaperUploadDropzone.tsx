'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';
import { getApiUrl } from '@/lib/api';

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/html': ['.html'],
};
const MAX_SIZE_BYTES = 100 * 1024 * 1024;

export type UploadedDocument = {
  documentId: string;
  fileName: string;
  fileSizeBytes: number;
  status: string;
  uploadedAt: string;
};

type Props = {
  meetingId: string;
  agendaItemId: string;
  onUploadSuccess?: (doc: UploadedDocument) => void;
};

export function PaperUploadDropzone({ meetingId, agendaItemId, onUploadSuccess }: Props) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_SIZE_BYTES) {
        setError(t('document.upload.fileTooLarge', { max: '100MB' }));
        return;
      }

      const accessToken = (session as { accessToken?: string } | null)?.accessToken;
      if (!accessToken) {
        setError(t('common.error'));
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const url = `${getApiUrl().replace(/\/$/, '')}/api/v1/meetings/${meetingId}/agenda/${agendaItemId}/documents/upload`;
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const msg =
            typeof errBody === 'object' && errBody !== null && 'message' in errBody
              ? String((errBody as { message?: string }).message)
              : t('common.error');
          throw new Error(msg || t('common.error'));
        }

        const doc = (await response.json()) as UploadedDocument;
        onUploadSuccess?.(doc);
        setProgress(100);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('common.error'));
      } finally {
        setUploading(false);
      }
    },
    [meetingId, agendaItemId, onUploadSuccess, router, session, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_BYTES,
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <p className="text-sm text-gray-600">{t('document.upload.uploading')}</p>
            <div className="mt-2 h-2 rounded bg-gray-200">
              <div className="h-2 rounded bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {isDragActive ? t('document.upload.dropHere') : t('document.upload.dropzone')}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {t('document.upload.acceptedTypes')} · {t('document.upload.maxSize', { max: '100MB' })}
        </p>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
