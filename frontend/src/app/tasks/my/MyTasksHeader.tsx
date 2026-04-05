'use client';

import { useTranslation } from '@/i18n/client';

export function MyTasksHeader({ overdueCount }: { overdueCount: number }) {
  const { t } = useTranslation('common');
  return (
    <div className="page-header mb-6">
      <h1 className="page-title">{t('nav.myTasks')}</h1>
      <p className="page-subtitle">Tasks assigned to you across meetings.</p>
      {overdueCount > 0 && (
        <div role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {t('task.dashboard.overdueAlert', { count: overdueCount })}
        </div>
      )}
    </div>
  );
}
