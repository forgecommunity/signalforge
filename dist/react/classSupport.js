import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
function readSignalValues(signals) {
    const next = {};
    for (const key of Object.keys(signals)) {
        next[key] = signals[key].get();
    }
    return next;
}
function getDisplayName(component) {
    return component.displayName || component.name || 'Component';
}
export function withSignals(WrappedComponent, signals, options) {
    var _a;
    return _a = class SignalForgeContainer extends React.Component {
            constructor(props) {
                super(props);
                this.unsubscribers = [];
                this.state = readSignalValues(signals);
            }
            componentDidMount() {
                this.unsubscribeAll();
                this.setState(readSignalValues(signals));
                this.unsubscribers = Object.keys(signals).map((key) => signals[key].subscribe(() => {
                    this.setState({ [key]: signals[key].get() });
                }));
            }
            componentWillUnmount() {
                this.unsubscribeAll();
            }
            unsubscribeAll() {
                for (const unsubscribe of this.unsubscribers) {
                    unsubscribe();
                }
                this.unsubscribers = [];
            }
            render() {
                return _jsx(WrappedComponent, { ...this.props, ...this.state });
            }
        },
        _a.displayName = options?.displayName || `WithSignals(${getDisplayName(WrappedComponent)})`,
        _a;
}
export function withSignalValue(WrappedComponent, signal, options) {
    return withSignals(WrappedComponent, { value: signal }, {
        displayName: options?.displayName,
    });
}
