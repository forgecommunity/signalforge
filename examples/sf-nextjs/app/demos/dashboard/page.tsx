'use client';

import { batch, createComputed, createSignal } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import DemoLayout from '../../components/DemoLayout';

type Region = 'all' | 'north' | 'south' | 'west';
type Incident = {
  id: number;
  region: Exclude<Region, 'all'>;
  service: string;
  severity: 'low' | 'medium' | 'high';
  minutesOpen: number;
  resolved: boolean;
};

const incidents = createSignal<Incident[]>([
  { id: 1, region: 'north', service: 'Checkout', severity: 'high', minutesOpen: 42, resolved: false },
  { id: 2, region: 'south', service: 'Search', severity: 'medium', minutesOpen: 18, resolved: false },
  { id: 3, region: 'west', service: 'Billing', severity: 'low', minutesOpen: 7, resolved: true },
  { id: 4, region: 'north', service: 'Profile', severity: 'medium', minutesOpen: 25, resolved: false },
]);
const selectedRegion = createSignal<Region>('all');
const showResolved = createSignal(false);

const visibleIncidents = createComputed(() => {
  const region = selectedRegion.get();
  const includeResolved = showResolved.get();

  return incidents.get().filter((incident) => {
    const regionMatches = region === 'all' || incident.region === region;
    const statusMatches = includeResolved || !incident.resolved;
    return regionMatches && statusMatches;
  });
});

const dashboardStats = createComputed(() => {
  const visible = visibleIncidents.get();
  const open = visible.filter((incident) => !incident.resolved);
  const high = open.filter((incident) => incident.severity === 'high');
  const averageMinutes = open.length
    ? open.reduce((sum, incident) => sum + incident.minutesOpen, 0) / open.length
    : 0;

  return {
    total: visible.length,
    open: open.length,
    high: high.length,
    averageMinutes,
  };
});

function simulateShiftChange() {
  batch(() => {
    selectedRegion.set('north');
    showResolved.set(false);
    incidents.set((current) =>
      current.map((incident) =>
        incident.id === 1 ? { ...incident, minutesOpen: incident.minutesOpen + 5 } : incident,
      ),
    );
  });
}

export default function DashboardDemo() {
  const stats = useSignalValue(dashboardStats);
  const rows = useSignalValue(visibleIncidents);
  const region = useSignalValue(selectedRegion);
  const includeResolved = useSignalValue(showResolved);

  return (
    <DemoLayout
      title="Operations Dashboard"
      description="A real dashboard pattern with filters, derived totals, and batched updates."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Visible', stats.total],
            ['Open', stats.open],
            ['High severity', stats.high],
            ['Avg minutes', stats.averageMinutes.toFixed(1)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {(['all', 'north', 'south', 'west'] as Region[]).map((item) => (
            <button
              key={item}
              onClick={() => selectedRegion.set(item)}
              className={`rounded-lg px-4 py-2 ${region === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'}`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => showResolved.set((value) => !value)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
          >
            {includeResolved ? 'Hide resolved' : 'Show resolved'}
          </button>
          <button onClick={simulateShiftChange} className="rounded-lg bg-slate-950 px-4 py-2 text-white dark:bg-white dark:text-slate-950">
            Simulate shift change
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          {rows.map((incident) => (
            <div key={incident.id} className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[1fr_120px_120px_120px] dark:border-slate-700">
              <strong>{incident.service}</strong>
              <span>{incident.region}</span>
              <span>{incident.severity}</span>
              <span>{incident.resolved ? 'resolved' : `${incident.minutesOpen} min`}</span>
            </div>
          ))}
        </div>
      </div>
    </DemoLayout>
  );
}
