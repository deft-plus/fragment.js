import { createSignal, type WritableSignal } from './signal.ts';
import { createMemoizedSignal } from './memo.ts';
import { isSignal, type ReadonlySignal } from './api.ts';

export { type ReadonlySignal, type SignalOptions } from './api.ts';
export * from './effect.ts';
export * from './memo.ts';
export * from './signal.ts';
export * from './untracked.ts';

type CreateSignal = typeof createSignal;
type CreateMemoizedSignal = typeof createMemoizedSignal;
type IsSignal = typeof isSignal;

export type SignalFn = CreateSignal & {
  memo: CreateMemoizedSignal;
  isSignal: IsSignal;
};

/**
 * Function to create a `Signal` that can be set or updated directly.
 *
 * Can also create memoized signals.
 */
export const signal: SignalFn = Object.assign(createSignal, {
  memo: createMemoizedSignal,
  isSignal,
});

/** A signal that can be read from and subscribed to. */
export type Signal<T = unknown> = ReadonlySignal<T> | WritableSignal<T>;
