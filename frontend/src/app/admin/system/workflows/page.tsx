import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { WorkflowConfigEditor } from './WorkflowConfigEditor';

/**
 * SCR-SYS-04 — Workflow configuration. Visual editor for approval workflow chains.
 * SA can enable/disable optional stages, set deadlines per stage, configure escalation.
 * Demo: step diagram + mock stages; save requires confirmation.
 */
export default async function WorkflowConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const stages = [
    { id: 'member', label: 'Member', role: 'Member', required: true, deadlineHours: 72, escalationGraceHours: 24 },
    { id: 'group_leader', label: 'Group Leader', role: 'Group Leader', required: true, deadlineHours: 48, escalationGraceHours: 24 },
    { id: 'delegation_leader', label: 'Delegation Leader', role: 'DELEGATION_LEADER', required: true, deadlineHours: 72, escalationGraceHours: 24 },
    { id: 'ic_division', label: 'IC Division', role: 'IC_DIVISION_HEAD', required: true, deadlineHours: 96, escalationGraceHours: 48 },
    { id: 'cs_na_css', label: 'CS/NA/CSS', role: 'SYSTEM_ADMIN', required: true, deadlineHours: 72, escalationGraceHours: 24 },
    { id: 'dg', label: 'DG', role: 'SYSTEM_ADMIN', required: true, deadlineHours: 72, escalationGraceHours: 24 },
    { id: 'mopsw', label: 'MoPSW', role: 'SYSTEM_ADMIN', required: false, deadlineHours: 120, escalationGraceHours: 48 },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Admin</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflow configuration</h1>
          <p className="page-subtitle">
            Configure the paper approval workflow: enable/disable optional stages, set deadlines per stage, and escalation rules. Changes apply to new workflow instances only.
          </p>
        </div>
      </div>
      <WorkflowConfigEditor stages={stages} />
    </div>
  );
}
