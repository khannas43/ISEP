'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { UserDto } from '@/lib/api';
import { createUser, updateUser } from './actions';

type CreateProps = { systemRoleOptions: { value: string; label: string }[] };
type EditProps = { user: UserDto; systemRoleOptions: { value: string; label: string }[] };
type Props = CreateProps | EditProps;

function isEditProps(props: Props): props is EditProps {
  return 'user' in props;
}

export function UserForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const systemRoleOptions = props.systemRoleOptions;
  const user = isEditProps(props) ? props.user : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (user) {
      const result = await updateUser(user.userId, {
        fullName: (formData.get('fullName') as string)?.trim() ?? '',
        email: (formData.get('email') as string)?.trim() || undefined,
        designation: (formData.get('designation') as string)?.trim() || null,
        organization: (formData.get('organization') as string)?.trim() || null,
        phone: (formData.get('phone') as string)?.trim() || null,
        systemRole: (formData.get('systemRole') as string) || undefined,
        isActive: formData.get('isActive') === 'on',
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/admin/users/${user.userId}`);
      router.refresh();
      return;
    }

    const result = await createUser({
      keycloakId: (formData.get('keycloakId') as string)?.trim() ?? '',
      email: (formData.get('email') as string)?.trim() ?? '',
      fullName: (formData.get('fullName') as string)?.trim() ?? '',
      designation: (formData.get('designation') as string)?.trim() || null,
      organization: (formData.get('organization') as string)?.trim() || null,
      phone: (formData.get('phone') as string)?.trim() || null,
      systemRole: (formData.get('systemRole') as string) ?? 'VIEWER',
      isActive: formData.get('isActive') === 'on',
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.id) {
      router.push(`/admin/users/${result.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <div className="rounded bg-red-50 text-red-700 px-4 py-2 text-base">
          {error}
        </div>
      )}
      {!user && (
        <div>
          <label htmlFor="keycloakId" className="block text-base font-medium text-slate-700 mb-1">
            Keycloak ID *
          </label>
          <input
            id="keycloakId"
            name="keycloakId"
            type="text"
            required
            className="input-base"
            placeholder="e.g. UUID from Keycloak"
          />
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-base font-medium text-slate-700 mb-1">
          Full name *
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={user?.fullName}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-base font-medium text-slate-700 mb-1">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={user?.email}
          className="input-base"
          readOnly={!!user}
          title={user ? 'Email cannot be changed' : undefined}
        />
      </div>
      <div>
        <label htmlFor="designation" className="block text-base font-medium text-slate-700 mb-1">
          Designation
        </label>
        <input
          id="designation"
          name="designation"
          type="text"
          defaultValue={user?.designation ?? ''}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="organization" className="block text-base font-medium text-slate-700 mb-1">
          Organization
        </label>
        <input
          id="organization"
          name="organization"
          type="text"
          defaultValue={user?.organization ?? ''}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-base font-medium text-slate-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={user?.phone ?? ''}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="systemRole" className="block text-base font-medium text-slate-700 mb-1">
          System role *
        </label>
        <select
          id="systemRole"
          name="systemRole"
          required
          defaultValue={user?.systemRole ?? 'VIEWER'}
          className="input-base"
        >
          {systemRoleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={user?.isActive ?? true}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-base font-medium text-slate-700">
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          {user ? 'Save changes' : 'Create user'}
        </button>
        <Link
          href={user ? `/admin/users/${user.userId}` : '/admin/users'}
          className="btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
