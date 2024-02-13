/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { createSignalFromFunction, defaultEquals, ReadonlySignal, SignalOptions } from './api.ts';
import { ReactiveNode } from './graph.ts';
import { untracked } from './untracked.ts';

const throwInvalidWriteToSignalError = () => {};

/** Options passed to the `signal` creation function. */
// Disabled because we might want to add more options in the future.
// deno-lint-ignore ban-types
export type CreateSignalOptions<T> = SignalOptions<T> & {};

/** Create a `Signal` that can be set or updated directly. */
export function createSignal<T>(
  initialValue: T,
  options: CreateSignalOptions<T> = {},
): WritableSignal<T> {
  const {
    id = `unnamed_signal_${Math.random().toString(36).slice(2)}`,
    log = false,
    equal = defaultEquals,
    onChange = () => {},
  } = options;

  const signalNode = new WritableSignalImpl(initialValue, { id, log, equal, onChange });

  const signalFn = createSignalFromFunction(signalNode, signalNode.signal.bind(signalNode), {
    set: signalNode.set.bind(signalNode),
    update: signalNode.update.bind(signalNode),
    mutate: signalNode.mutate.bind(signalNode),
    readonly: signalNode.readonly.bind(signalNode),
    untracked: signalNode.untracked.bind(signalNode),
  }) as WritableSignal<T>;

  return signalFn;
}

/** A `Signal` with a value that can be mutated via a setter interface. */
export type WritableSignal<T = unknown> = ReadonlySignal<T> & {
  /**
   * Directly set the signal to a new value, and notify any dependents.
   */
  set(value: T): void;

  /**
   * Update the value of the signal based on its current value, and
   * notify any dependents.
   */
  update(updateFn: (value: T) => T): void;

  /**
   * Update the current value by mutating it in-place, and
   * notify any dependents.
   */
  mutate(mutatorFn: (value: T) => void): void;

  /**
   * Returns a readonly version of this signal. Readonly signals can be accessed to read their value
   * but can't be changed using set, update or mutate methods. The readonly signals do _not_ have
   * any built-in mechanism that would prevent deep-mutation of their value.
   */
  readonly(): ReadonlySignal<T>;

  /**
   * Returns the value and marks the signal as untracked. This is useful when you want to read the
   * value of a signal without creating a dependency on it.
   */
  untracked(): T;
};

class WritableSignalImpl<T> extends ReactiveNode {
  constructor(
    private value: T,
    private options: Required<CreateSignalOptions<T>>,
  ) {
    super();
  }

  private readonlySignal: ReadonlySignal<T> | undefined;

  protected override readonly consumerAllowSignalWrites = false;

  protected override onConsumerDependencyMayHaveChanged(): void {
    // This never happens for writable signals as they're not consumers.
  }

  protected override onProducerUpdateValueVersion(): void {
    // Writable signal value versions are always up to date.
  }

  /**
   * Directly update the value of the signal to a new value, which may or may not be
   * equal to the previous.
   *
   * In the event that `newValue` is semantically equal to the current value, `set` is
   * a no-op.
   */
  set(newValue: T): void {
    if (!this.producerUpdatesAllowed) {
      throwInvalidWriteToSignalError();
    }
    if (!this.options.equal(this.value, newValue)) {
      this.value = newValue;
      this.valueVersion++;
      this.producerMayHaveChanged();

      this.options.onChange?.(this.value);
    }
  }

  /**
   * Derive a new value for the signal from its current value using the `updater` function.
   *
   * This is equivalent to calling `set` on the result of running `updater` on the current
   * value.
   */
  update(updater: (value: T) => T): void {
    if (!this.producerUpdatesAllowed) {
      throwInvalidWriteToSignalError();
    }
    this.set(updater(this.value));
  }

  /**
   * Calls `mutator` on the current value and assumes that it has been mutated.
   */
  mutate(mutator: (value: T) => void): void {
    if (!this.producerUpdatesAllowed) {
      throwInvalidWriteToSignalError();
    }
    // Mutate bypasses equality checks as it's by definition changing the value.
    mutator(this.value);
    this.valueVersion++;
    this.producerMayHaveChanged();

    this.options.onChange?.(this.value);
  }

  readonly(): ReadonlySignal<T> {
    if (this.readonlySignal === undefined) {
      this.readonlySignal = createSignalFromFunction(this, () => this.signal());
    }
    return this.readonlySignal;
  }

  untracked(): T {
    return untracked(() => this.signal());
  }

  signal(): T {
    this.producerAccessed();

    // TODO(@miguelbogota): Mark the value as a signal value so that it can't be identified as a signal value.
    // const markedValued = Object.assign(this.value as object, {
    //   isSignalValue: true,
    // }) as T;

    // return markedValued;

    return this.value;
  }
}
