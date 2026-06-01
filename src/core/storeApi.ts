import {
  createComputed,
  createSignal,
  type ComputedSignal,
  type Signal,
} from './store';

export type StoreUpdater<T> = Partial<T> | ((previous: T) => T);
export type StoreSelectorEquality<T> = (previous: T, next: T) => boolean;

export function shallowEqual<T>(previous: T, next: T): boolean {
  if (Object.is(previous, next)) {
    return true;
  }

  if (
    previous === null ||
    next === null ||
    typeof previous !== 'object' ||
    typeof next !== 'object'
  ) {
    return false;
  }

  if (Array.isArray(previous) || Array.isArray(next)) {
    if (!Array.isArray(previous) || !Array.isArray(next)) {
      return false;
    }

    if (previous.length !== next.length) {
      return false;
    }

    for (let i = 0; i < previous.length; i++) {
      if (!Object.is(previous[i], next[i])) {
        return false;
      }
    }

    return true;
  }

  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of previousKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(next, key) ||
      !Object.is(
        (previous as Record<string, unknown>)[key],
        (next as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
}

export interface SignalStore<T extends Record<string, any>> {
  readonly signal: Signal<T>;
  get(): T;
  set(update: StoreUpdater<T>): void;
  select<R>(
    selector: (state: T) => R,
    equals?: StoreSelectorEquality<R>
  ): ComputedSignal<R>;
  subscribe(listener: (state: T) => void): () => void;
  destroy(): void;
}

export function createStore<T extends Record<string, any>>(
  initialState: T
): SignalStore<T> {
  const signal = createSignal(initialState);

  return {
    signal,

    get(): T {
      return signal.get();
    },

    set(update: StoreUpdater<T>): void {
      if (typeof update === 'function') {
        signal.set(update as (previous: T) => T);
        return;
      }

      signal.set((previous) => ({ ...previous, ...update }));
    },

    select<R>(
      selector: (state: T) => R,
      equals: StoreSelectorEquality<R> = Object.is
    ): ComputedSignal<R> {
      let hasSelection = false;
      let previousSelection: R;

      return createComputed(() => {
        const nextSelection = selector(signal.get());

        if (hasSelection && equals(previousSelection, nextSelection)) {
          return previousSelection;
        }

        hasSelection = true;
        previousSelection = nextSelection;
        return nextSelection;
      });
    },

    subscribe(listener: (state: T) => void): () => void {
      return signal.subscribe(listener);
    },

    destroy(): void {
      signal.destroy();
    },
  };
}

export function defineStore<TStore>(factory: () => TStore): TStore {
  return factory();
}
