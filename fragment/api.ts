/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

/**
 * Symbol used to tell `Fragment`s apart from other functions.
 */
export const FRAGMENT = Symbol('__internal_fragment_meta__');

/** Checks if the given `value` function is a fragment. */
export function isFragment(value: unknown): value is JSX.Element {
  return !!(value as JSX.FragmentElement)[FRAGMENT];
}

/** Marks the given `value` as a fragment. */
export function markFragment(value: unknown) {
  Object.defineProperty(value, FRAGMENT, {
    value: true,
    writable: false,
  });
  return value;
}
