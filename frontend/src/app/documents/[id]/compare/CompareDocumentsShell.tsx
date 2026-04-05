'use client'

import { useRouter } from 'next/navigation'
import { VersionSelector, type CompareVersionOption } from '@/components/editor/VersionSelector'
import { VersionDiffViewer } from '@/components/editor/VersionDiffViewer'

type Props = {
  documentId: string
  versions: CompareVersionOption[]
  fromVersion: number
  toVersion: number
}

export function CompareDocumentsShell({ documentId, versions, fromVersion, toVersion }: Props) {
  const router = useRouter()

  const clampTo = (newFrom: number, currentTo: number) => {
    const greater = versions.filter((v) => v.version > newFrom).map((v) => v.version)
    if (greater.length === 0) return newFrom
    if (greater.includes(currentTo)) return currentTo
    return Math.min(...greater)
  }

  return (
    <div className="space-y-6">
      <VersionSelector
        versions={versions}
        fromVersion={fromVersion}
        toVersion={toVersion}
        onFromChange={(v) => {
          const nextTo = clampTo(v, toVersion)
          router.push(`/documents/${documentId}/compare?from=${v}&to=${nextTo}`)
        }}
        onToChange={(v) => {
          router.push(`/documents/${documentId}/compare?from=${fromVersion}&to=${v}`)
        }}
      />
      <VersionDiffViewer documentId={documentId} fromVersion={fromVersion} toVersion={toVersion} />
    </div>
  )
}
