'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSignal } from 'signalforge/core';
import { clearPlugins, registerPlugin, unregisterPlugin } from 'signalforge/plugins';
import { useSignalValue } from 'signalforge/react';
import DemoLayout from '../../components/DemoLayout';

const accountBalance = createSignal(1200);
const auditEvents = createSignal<string[]>([]);

export default function PluginDemo() {
  const balance = useSignalValue(accountBalance);
  const events = useSignalValue(auditEvents);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      clearPlugins();
      return;
    }

    registerPlugin({
      name: 'demo-audit-plugin',
      version: '1.0.0',
      onSignalUpdate(context) {
        auditEvents.set((current) => [
          `${context.signal.id}: ${JSON.stringify(context.oldValue)} -> ${JSON.stringify(context.newValue)}`,
          ...current.slice(0, 7),
        ]);
      },
    });

    return () => {
      unregisterPlugin('demo-audit-plugin');
    };
  }, [enabled]);

  const riskLabel = useMemo(() => {
    if (balance < 500) return 'review';
    if (balance > 1800) return 'healthy';
    return 'normal';
  }, [balance]);

  return (
    <DemoLayout
      title="Plugin Debugging"
      description="A practical plugin route for auditing signal writes and validating DevTools plugin diagnostics."
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="text-sm text-slate-500 dark:text-slate-400">Account balance</div>
          <div className="mt-2 text-4xl font-bold">${balance}</div>
          <div className="mt-2 text-sm">Risk state: {riskLabel}</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setEnabled((value) => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
            {enabled ? 'Disable plugin' : 'Enable plugin'}
          </button>
          <button onClick={() => accountBalance.set((value) => value + 125)} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">
            Deposit
          </button>
          <button onClick={() => accountBalance.set((value) => Math.max(0, value - 250))} className="rounded-lg bg-rose-600 px-4 py-2 text-white">
            Withdraw
          </button>
        </div>

        <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h2 className="mb-3 text-lg font-semibold">Audit events</h2>
          {events.length === 0 ? (
            <p className="text-slate-500">Enable the plugin and update the balance to capture writes.</p>
          ) : (
            <div className="grid gap-2">
              {events.map((event, index) => (
                <code key={`${event}-${index}`} className="rounded bg-slate-950 p-3 text-sm text-emerald-200">
                  {event}
                </code>
              ))}
            </div>
          )}
        </section>
      </div>
    </DemoLayout>
  );
}
