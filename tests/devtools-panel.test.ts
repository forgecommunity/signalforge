import assert from 'node:assert/strict';
import {
  buildGraphLayout,
  filterGraphSignals,
  groupTimelineEvents,
} from '../src/devtools/ui/DevToolsPanel';
import type { DevToolsEvent, SignalMetadata } from '../src/devtools/runtime';

const now = Date.UTC(2026, 0, 1, 10, 5, 30);

function signal(partial: Partial<SignalMetadata> & Pick<SignalMetadata, 'id' | 'type'>): SignalMetadata {
  return {
    name: partial.id,
    value: null,
    subscriberCount: 0,
    dependencies: [],
    subscribers: [],
    createdAt: now,
    updatedAt: now,
    updateCount: 0,
    ...partial,
  };
}

const graph = [
  signal({ id: 'count', type: 'signal', subscribers: ['double'] }),
  signal({ id: 'double', type: 'computed', dependencies: ['count'], subscribers: ['effect'] }),
  signal({ id: 'effect', type: 'effect', dependencies: ['double'] }),
];

const layout = buildGraphLayout(graph);
assert.equal(layout.nodes.length, 3);
assert.equal(layout.edges.length, 2);
assert.ok((layout.nodes.find((node) => node.id === 'double')?.x || 0) > (layout.nodes.find((node) => node.id === 'count')?.x || 0));

const filtered = filterGraphSignals(graph, 'double', 'computed');
assert.deepEqual(filtered.map((item) => item.id).sort(), ['count', 'double', 'effect']);

const event = (sequence: number, timestamp: number): DevToolsEvent => ({
  type: 'signal-updated',
  payload: { signalId: `signal-${sequence}` },
  timestamp,
  sequence,
});

const grouped = groupTimelineEvents([
  event(1, now),
  event(2, now + 200),
  event(3, now + 1200),
]);

assert.equal(grouped.length, 2);
assert.equal(grouped[0].events.length, 2);
assert.equal(grouped[1].events.length, 1);

console.log('DevTools panel helper tests passed');
