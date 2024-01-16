/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { ReactiveNode } from './graph.ts';

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
const SIGNAL = Symbol('SIGNAL');

/** Internal type to add the `signal` symbol to the given `T` type. */
type WithSignal<T> = T & { [SIGNAL]: unknown };

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 */
export type ReadonlySignal<T = unknown> = (() => T) & {
  [SIGNAL]: unknown;
};

/**
 * Optional configuration to create a signal.
 */
export type SignalOptions<T> = {
  /**
   * Unique identifier of the signal. Serves as a human-readable name that allows developers to
   * quickly identify specific signals in logs and development tools. Additionally, it is used to
   * generate mock data during testing, providing a convenient way to simulate signal behavior
   * in various scenarios.
   */
  id?: string;
  /**
   * Whether to log the signal's value when it changes. Defaults to `false`.
   *
   * Recommended to set to `Deno.env.get('ENVIRONMENT') === 'development'` to only log in
   * development mode.
   *
   * Will be ignored in production mode.
   */
  log?: boolean;
  /**
   * Function checks whether there has been a change in the signal value. It is specifically
   * designed to work with writable signals and is used to inform consumers of any changes that
   * may have occurred. If this function is not supplied, the default equality function will be
   * utilized instead.
   */
  equal?: (a: T, b: T) => boolean;
  /**
   * If set, called after the signal changes and gets updated with the new value.
   *
   * This hook can be used to achieve various effects, such as running effects synchronously as part
   * of setting a signal.
   */
  onChange?: (newValue: T) => void;
};

/** Checks if the given `value` function is a reactive `Signal`. */
export function isSignal(value: unknown): value is ReadonlySignal<unknown> {
  if (!value) {
    return false;
  }

  return (value as ReadonlySignal<unknown>)[SIGNAL] !== undefined;
}

/** Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`). */
export function createSignalFromFunction<T>(node: ReactiveNode, fn: () => T): ReadonlySignal<T>;

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`), and
 * potentially add some set of extra properties (passed as an object record `extraApi`).
 */
export function createSignalFromFunction<T, U extends Record<string, unknown>>(
  node: ReactiveNode,
  fn: () => T,
  extraApi: U,
): ReadonlySignal<T> & U;

export function createSignalFromFunction<T, U extends Record<string, unknown>>(
  node: ReactiveNode,
  fn: () => T,
  extraApi: U = ({} as U),
): ReadonlySignal<T> & U {
  (fn as WithSignal<() => T>)[SIGNAL] = node;
  // Copy properties from `extraApi` to `fn` to complete the desired API of the `Signal`.
  return Object.assign(fn, extraApi) as (ReadonlySignal<T> & U);
}

/**
 * The default equality function used for `signal` and `computed`, which treats objects and arrays
 * as never equal, and all other primitive values using identity semantics.
 *
 * This allows signals to hold non-primitive values (arrays, objects, other collections) and still
 * propagate change notification upon explicit mutation without identity change.
 */
export function defaultEquals<T>(a: T, b: T) {
  // `Object.is` compares two values using identity semantics which is desired behavior for
  // primitive values. If `Object.is` determines two values to be equal we need to make sure that
  // those don't represent objects (we want to make sure that 2 objects are always considered
  // "unequal"). The null check is needed for the special case of JavaScript reporting null values
  // as objects (`typeof null === 'object'`).
  return (a === null || typeof a !== 'object') && Object.is(a, b);
}
