'use client'

import { useTranslation } from '@/i18n/client'

export interface CompareVersionOption {
  id: string
  version: number
  savedByName: string
  savedAt: string
}

interface Props {
  versions: CompareVersionOption[]
  fromVersion: number
  toVersion: number
  onFromChange: (v: number) => void
  onToChange: (v: number) => void
}

export function VersionSelector({
  versions,
  fromVersion,
  toVersion,
  onFromChange,
  onToChange,
}: Props) {
  const { t } = useTranslation('common')

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="text-slate-600">{t('diff.baseVersion')}:</label>
      <select
        value={fromVersion}
        onChange={(e) => onFromChange(Number(e.target.value))}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
      >
        {versions.map((v) => (
          <option key={v.id} value={v.version}>
            v{v.version} — {v.savedByName}
          </option>
        ))}
      </select>

      <span className="text-slate-400">→</span>

      <label className="text-slate-600">{t('diff.compareVersion')}:</label>
      <select
        value={toVersion}
        onChange={(e) => onToChange(Number(e.target.value))}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
      >
        {versions
          .filter((v) => v.version > fromVersion)
          .map((v) => (
            <option key={v.id} value={v.version}>
              v{v.version} — {v.savedByName}
            </option>
          ))}
      </select>
    </div>
  )
}
