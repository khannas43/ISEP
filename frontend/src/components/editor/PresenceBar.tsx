'use client'

import { useTranslation } from '@/i18n/client'
import { memo } from 'react'

export interface ConnectedUser {
  clientId: string
  name: string
  color: string
}

interface Props {
  users: ConnectedUser[]
}

function usersSignature(users: ConnectedUser[]): string {
  return JSON.stringify(
    users.map((u) => ({ clientId: u.clientId, name: u.name, color: u.color }))
  )
}

export const PresenceBar = memo(function PresenceBar({ users }: Props) {
  const { t } = useTranslation('common')
  if (users.length === 0) return null

  return (
    <div
      className="flex items-center gap-2 border-b bg-blue-50 px-4 py-1 text-sm text-blue-700"
      role="status"
    >
      <span>{t('editor.alsoEditing')}:</span>
      {users.map((u) => (
        <span
          key={u.clientId}
          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: u.color }}
        >
          {u.name}
        </span>
      ))}
    </div>
  )
}, (prev, next) => usersSignature(prev.users) === usersSignature(next.users))
