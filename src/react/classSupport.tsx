import React from 'react';
import type { ComponentType } from 'react';
import type { Signal } from '../core/store';

/**
 * Map a set of signals to their resolved values.
 */
export type SignalValues<Signals extends Record<string, Signal<any>>> = {
  [K in keyof Signals]: Signals[K] extends Signal<infer T> ? T : never;
};

function readSignalValues<Signals extends Record<string, Signal<any>>>(signals: Signals): SignalValues<Signals> {
  const next: Partial<SignalValues<Signals>> = {};
  for (const key of Object.keys(signals)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next[key as keyof Signals] = signals[key as keyof Signals].get() as any;
  }
  return next as SignalValues<Signals>;
}

function getDisplayName(component: ComponentType<any>) {
  return component.displayName || component.name || 'Component';
}

/**
 * Higher-order component to make SignalForge signals available to class components
 * (or function components that prefer prop injection over hooks).
 *
 * The provided signals are subscribed to on mount and unsubscribed on unmount.
 * Whenever a signal updates, the wrapped component receives the latest value via props.
 */
export function withSignals<P extends object, Signals extends Record<string, Signal<any>>>(
  WrappedComponent: ComponentType<P & SignalValues<Signals>>,
  signals: Signals,
  options?: { displayName?: string }
): ComponentType<P> {
  type State = SignalValues<Signals>;

  return class SignalForgeContainer extends React.Component<P, State> {
    static displayName = options?.displayName || `WithSignals(${getDisplayName(WrappedComponent)})`;

    private unsubscribers: Array<() => void> = [];

    constructor(props: P) {
      super(props);
      this.state = readSignalValues(signals);
    }

    componentDidMount() {
      this.unsubscribeAll();
      this.setState(readSignalValues(signals));
      this.unsubscribers = Object.keys(signals).map((key) =>
        signals[key].subscribe(() => {
          this.setState({ [key]: signals[key].get() } as unknown as State);
        })
      );
    }

    componentWillUnmount() {
      this.unsubscribeAll();
    }

    private unsubscribeAll() {
      for (const unsubscribe of this.unsubscribers) {
        unsubscribe();
      }
      this.unsubscribers = [];
    }

    render() {
      return <WrappedComponent {...(this.props as P)} {...(this.state as State)} />;
    }
  };
}

/**
 * Convenience wrapper for a single signal value.
 */
export function withSignalValue<P extends object, T>(
  WrappedComponent: ComponentType<P & { value: T }>,
  signal: Signal<T>,
  options?: { displayName?: string }
): ComponentType<P> {
  return withSignals<P, { value: Signal<T> }>(WrappedComponent, { value: signal }, {
    displayName: options?.displayName,
  });
}
