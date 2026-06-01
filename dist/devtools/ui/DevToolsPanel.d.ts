import React from 'react';
import { type SignalMetadata, type DevToolsEvent } from '../runtime';
export declare const DevToolsPanel: React.FC;
export declare const DevToolsProvider: React.FC<{
    children: React.ReactNode;
}>;
interface GraphLayoutNode {
    id: string;
    label: string;
    type: SignalMetadata['type'];
    updateCount: number;
    x: number;
    y: number;
}
export declare function buildGraphLayout(signals: SignalMetadata[]): {
    width: number;
    height: number;
    nodes: GraphLayoutNode[];
    edges: Array<{
        from: string;
        to: string;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }>;
};
export declare function filterGraphSignals(signals: SignalMetadata[], query: string, typeFilter: 'all' | SignalMetadata['type']): SignalMetadata[];
export declare function groupTimelineEvents(events: DevToolsEvent[]): Array<{
    key: string;
    label: string;
    events: DevToolsEvent[];
}>;
export default DevToolsPanel;
//# sourceMappingURL=DevToolsPanel.d.ts.map