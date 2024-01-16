/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { createSignalFromFunction, defaultEquals, ReadonlySignal, SignalOptions } from './api.ts';
import { ReactiveNode, setActiveConsumer } from './graph.ts';

/** Options passed to the `memoized` creation function. */
// Disabled because we might want to add more options in the future.
// deno-lint-ignore ban-types
export type CreateMemoizedSignalOptions<T> = SignalOptions<T> & {};

/** Create a memoized `Signal` which derives a reactive value from an expression. */
export function createMemoizedSignal<T>(
  computation: () => T,
  options?: CreateMemoizedSignalOptions<T>,
): ReadonlySignal<T> {
  const {
    id = 'unnamed_signal',
    log = false,
    equal = defaultEquals,
    onChange = () => {},
  } = options ?? {};

  const node = new MemoizedImpl(computation, { id, log, equal, onChange });

  return createSignalFromFunction(node, node.signal.bind(node), {
    untracked: node.untracked.bind(node),
  }) as MemoizedSignal<T>;
}

/**
 * A dedicated symbol used before a memoized value has been calculated for the first time.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const UNSET = Symbol('UNSET');

/**
 * A dedicated symbol used in place of a memoized signal value to indicate that a given computation
 * is in progress. Used to detect cycles in computation chains.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const COMPUTING = Symbol('COMPUTING');

/**
 * A dedicated symbol used in place of a memoized signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const ERRORED = Symbol('ERRORED');

/** A memoized value, or one of the special values `UNSET`, `COMPUTING`, or `ERRORED`. */
type MemoizedValue<T> = T | typeof UNSET | typeof COMPUTING | typeof ERRORED;

/** A `ReadonlySignal` with a value that can be untracked. */
export type MemoizedSignal<T> = ReadonlySignal<T> & {
  /**
   * Returns the value and marks the signal as untracked. This is useful when you want to read the
   * value of a signal without creating a dependency on it.
   */
  untracked(): T;
};

/**
 * A computation, which derives a value from a declarative reactive expression.
 *
 * `Memoized`s are both producers and consumers of reactivity.
 */
class MemoizedImpl<T> extends ReactiveNode {
  constructor(
    private computation: () => T,
    private options: Required<CreateMemoizedSignalOptions<T>>,
  ) {
    super();
  }
  /**
   * Current value of the computation.
   *
   * This can also be one of the special values `UNSET`, `COMPUTING`, or `ERRORED`.
   */
  private value: MemoizedValue<T> = UNSET;

  /**
   * If `value` is `ERRORED`, the error caught from the last computation attempt which will
   * be re-thrown.
   */
  private error: unknown = null;

  /**
   * Flag indicating that the computation is currently stale, meaning that one of the
   * dependencies has notified of a potential change.
   *
   * It's possible that no dependency has _actually_ changed, in which case the `stale`
   * state can be resolved without recomputing the value.
   */
  private stale = true;

  protected override readonly consumerAllowSignalWrites = false;

  protected override onConsumerDependencyMayHaveChanged(): void {
    if (this.stale) {
      // We've already notified consumers that this value has potentially changed.
      return;
    }

    // Record that the currently cached value may be stale.
    this.stale = true;

    // Notify any consumers about the potential change.
    this.producerMayHaveChanged();
  }

  protected override onProducerUpdateValueVersion(): void {
    if (!this.stale) {
      // The current value and its version are already up to date.
      return;
    }

    // The current value is stale. Check whether we need to produce a new one.

    if (
      this.value !== UNSET && this.value !== COMPUTING &&
      !this.consumerPollProducersForChange()
    ) {
      // Even though we were previously notified of a potential dependency update, all of
      // our dependencies report that they have not actually changed in value, so we can
      // resolve the stale state without needing to recompute the current value.
      this.stale = false;
      return;
    }

    // The current value is stale, and needs to be re-computed. It still may not change -
    // that depends on whether the newly computed value is equal to the old.
    this.recomputeValue();
  }

  private recomputeValue(): void {
    if (this.value === COMPUTING) {
      // Our computation somehow led to a cyclic read of itself.
      throw new Error('Detected cycle in computations.');
    }

    const oldValue = this.value;
    this.value = COMPUTING;

    // As we're re-running the computation, update our dependent tracking version number.
    this.trackingVersion++;
    const prevConsumer = setActiveConsumer(this);
    let newValue: MemoizedValue<T>;
    try {
      newValue = this.computation();
    } catch (err) {
      newValue = ERRORED;
      this.error = err;
    } finally {
      setActiveConsumer(prevConsumer);
    }

    this.stale = false;

    if (
      oldValue !== UNSET && oldValue !== ERRORED && newValue !== ERRORED &&
      this.options.equal(oldValue, newValue)
    ) {
      // No change to `valueVersion` - old and new values are
      // semantically equivalent.
      this.value = oldValue;
      return;
    }

    this.value = newValue;
    this.valueVersion++;
  }

  untracked(): T {
    const prevConsumer = setActiveConsumer(null);
    // We are not trying to catch any particular errors here, just making sure that the consumers
    // stack is restored in case of errors.
    try {
      return this.signal();
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }

  signal(): T {
    // Check if the value needs updating before returning it.
    this.onProducerUpdateValueVersion();

    // Record that someone looked at this signal.
    this.producerAccessed();

    if (this.value === ERRORED) {
      throw this.error;
    }

    return this.value as T;
  }
}
