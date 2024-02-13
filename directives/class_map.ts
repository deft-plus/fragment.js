/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { type ReadonlySignal, type Signal, signal } from '../signal/mod.ts';

/**
 * A directive that creates dynamic CSS classes based on the given `classInfo`.
 * The keys of the `classInfo` object are the CSS classes and the values are truthy values.
 * The CSS classes are return as a `ReadonlySignal` string.
 *
 * ```ts
 * const bar = true;
 * const className = classMap({ foo: bar });
 * // className() returns 'foo' since bar is truthy.
 * ```
 *
 * @param classInfo is an object to validate and convert to CSS classes.
 * @returns A `ReadonlySignal` string with the CSS classes whose keys are truthy.
 */
export const classMap: ClassMapFn = Object.assign(baseClassMap, {
  group: groupClassMap,
});

/** Base implementation of `classMap` without the `create` function. */
function baseClassMap(classInfo: ClassInfo): ReadonlySignal<string> {
  return classMapImpl(classInfo);
}

/** Implementation of `classMap.group` to create a group of `classMap` directives. */
function groupClassMap<T extends Record<string, ClassInfo>>(
  groups: T,
): { [K in keyof T]: ReadonlySignal<string> } {
  return Object.entries(groups).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: classMapImpl(value),
    }),
    {},
  ) as { [K in keyof T]: ReadonlySignal<string> };
}

/** Implementation of `classMap` and `createClassMap`. */
function classMapImpl(classInfo: ClassInfo): ReadonlySignal<string> {
  const hasSignals = Object.values(classInfo).some(
    // This validation does not use `isSignal` since a computed values is just a function and
    // `isSignal` would return `false` for it.
    (value) => typeof value === 'function',
  );

  if (!hasSignals) {
    const staticClassNames = Object.entries(classInfo)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(' ');
    return signal(staticClassNames).readonly();
  }

  return signal.memo(() =>
    Object.entries(classInfo)
      .filter(([_, value]) => typeof value === 'function' ? value() : value)
      .map(([key]) => key)
      .join(' ')
  );
}

/** Allowed values to use in the `classInfo` object to check for truthiness. */
type ClassInfoValue = string | number | boolean | null | undefined;

/** A key-value set of class names to truthy values to generate the CSS classes. */
export type ClassInfo = Record<
  string,
  // Primitives
  | ClassInfoValue
  // Signals
  | Signal<ClassInfoValue>
  // Computed signals
  | (() => ClassInfoValue)
>;

/** Directive that creates dynamic CSS classes based on the given `classInfo`. */
type ClassMapDirective = (classInfo: ClassInfo) => ReadonlySignal<string>;

/** Directive that creates dynamic CSS classes grouped together to use better. */
type ClassMapGroupDirective = <T extends Record<string, ClassInfo>>(
  groups: T,
) => { [K in keyof T]: ReadonlySignal<string> };

type ClassMapFn = ClassMapDirective & {
  /**
   * In certain scenarios, it is very good idea to group the class names and use a namespace to get
   * the needed class name. This directive offers a straightforward method to achieve this using the
   * `group` method. This function allows you to group the class names into a single namespace.
   *
   * ```ts
   * const classNames = classMap.group({
   *   foo: {
   *     bar: true,
   *     baz: false,
   *   },
   *   hello: {
   *     world: true,
   *   },
   * });
   *
   * // classNames.foo() returns 'bar' since baz is falsy.
   * // classNames.hello() returns 'world' since it is truthy.
   * ```
   *
   * This is very useful when you have a component with multiple child component with very dynamic
   * class names and want to group them together to avoid nest the `classMap` function multiple
   * times.
   */
  group: ClassMapGroupDirective;
};
