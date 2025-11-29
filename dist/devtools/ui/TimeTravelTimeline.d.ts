import React from 'react';
import { TimeTravelPlugin } from '../../plugins/timeTravel';
export interface TimeTravelTimelineProps {
    plugin: TimeTravelPlugin;
    refreshInterval?: number;
    showDetails?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const TimeTravelTimeline: React.FC<TimeTravelTimelineProps>;
export default TimeTravelTimeline;
//# sourceMappingURL=TimeTravelTimeline.d.ts.map