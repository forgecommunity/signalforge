import React from 'react';
import type { LoggerPlugin } from '../../plugins/logger';
export interface LogViewerProps {
    plugin: LoggerPlugin;
    refreshInterval?: number;
    maxDisplayLogs?: number;
    showStats?: boolean;
    autoScroll?: boolean;
    style?: React.CSSProperties;
}
export declare function LogViewer({ plugin, refreshInterval, maxDisplayLogs, showStats, autoScroll, style, }: LogViewerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LogViewer.d.ts.map