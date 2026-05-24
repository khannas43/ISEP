'use client';

import { useTranslation } from '@/i18n/client';
import type { PaperApprovalStageDto } from '@/lib/api';

type Props = {
  stages: PaperApprovalStageDto[];
  currentStage: string;
  mopswStepActive: boolean;
};

export function ApprovalChainStatus({ stages, currentStage, mopswStepActive }: Props) {
  const { t } = useTranslation('common');

  const displayStages = mopswStepActive
    ? stages
    : stages.filter((s) => !s.stageName?.toUpperCase().includes('MOPSW'));

  let currentIdx = displayStages.findIndex((s) => s.stageName === currentStage);
  if (currentIdx < 0) {
    currentIdx = displayStages.findIndex((s) => s.status === 'PENDING');
  }
  if (currentIdx < 0) {
    currentIdx = displayStages.length > 0 ? displayStages.length - 1 : 0;
  }

  return (
    <div className="mb-6">
      <p className="mb-2 text-base font-medium text-slate-700">{t('approval.chain')}</p>
      <div className="flex items-center gap-0 overflow-x-auto py-2">
        {displayStages.map((stage, idx) => {
          const done = idx < currentIdx;
          const current = idx === currentIdx;
          const pending = idx > currentIdx;
          return (
            <div key={stage.stageId} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold
                ${done ? 'border-green-500 bg-green-500 text-white' : ''}
                ${current ? 'border-blue-600 bg-blue-600 text-white' : ''}
                ${pending ? 'border-gray-300 bg-white text-gray-400' : ''}
              `}
                >
                  {done ? '✓' : idx + 1}
                </div>
                <span
                  className={`
                mt-1 w-16 text-center text-sm leading-tight
                ${current ? 'font-medium text-blue-700' : ''}
                ${done ? 'text-green-700' : ''}
                ${pending ? 'text-gray-400' : ''}
              `}
                >
                  {stage.stageName}
                </span>
              </div>
              {idx < displayStages.length - 1 && (
                <div
                  className={`
                -mt-4 h-0.5 w-8 shrink-0
                ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}
              `}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {t('approval.currentStage')}: <strong className="text-slate-800">{currentStage}</strong>
      </p>
    </div>
  );
}
