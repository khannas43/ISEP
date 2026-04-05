'use client';

type Service = {
  id: string;
  name: string;
  status: 'green' | 'amber' | 'red';
  lastHeartbeat: string;
  responseTimeMs: number;
  errorRate: number;
};

type Props = { services: Service[] };

const statusColors = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' };

export function SystemHealthDashboard({ services }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleString()}. Refresh every 30s in production.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="card">
            <div className="card-body flex flex-row items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900">{s.name}</h3>
                <p className="mt-1 text-xs text-slate-500">Last heartbeat: {new Date(s.lastHeartbeat).toLocaleTimeString()}</p>
                <p className="mt-1 text-sm text-slate-600">Response: {s.responseTimeMs} ms · Error rate: {(s.errorRate * 100).toFixed(2)}%</p>
              </div>
              <span className={`inline-block h-3 w-3 shrink-0 rounded-full ${statusColors[s.status]}`} title={s.status} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <strong>Grafana:</strong> In production, each card would link to the corresponding Grafana dashboard for detailed metrics.
      </div>
    </div>
  );
}
