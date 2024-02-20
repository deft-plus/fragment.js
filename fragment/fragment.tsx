/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { markFragment } from './api.ts';
import { ReadonlySignal, signal, WritableSignal } from '../signal/mod.ts';

type Primitive = string | number | boolean | null | undefined;
type Computed<T> = () => T;
type Server<T> = () => Promise<T>;

type ValidAttributes = Record<string, Primitive | Computed<unknown> | Server<unknown>>;

type InferAttributes<T extends ValidAttributes> =
  & {
    // Only primitive properties must be optional
    [K in keyof T as T[K] extends Primitive ? K : never]?: T[K];
  }
  & {
    // Computed properties must be required or as the given type.
    [K in keyof T as T[K] extends Primitive ? never : K]: T[K] extends Server<infer S>
      ? (attrs: InferAttributesWithSignals<Omit<T, K>>) => Promise<S>
      : T[K] extends Computed<infer R>
      // Computed value
        ? R extends void ? never
        : (attrs: InferAttributesWithSignals<Omit<T, K>>) => R
      : never;
  };

type InferAttributesWithSignals<T extends ValidAttributes, Write = false> =
  & {
    [K in keyof T]: T[K] extends Primitive
      // Primitive value
      ? Write extends true ? WritableSignal<T[K]>
      : ReadonlySignal<T[K]>
      : T[K] extends () => infer R
      // Computed value
        ? ReadonlySignal<Awaited<R>>
      : never;
  }
  & {
    _context: any;
    _ref: any;
  };

type RemoveComputedAndServer<T extends ValidAttributes> = {
  [K in keyof T as T[K] extends () => unknown ? never : K]: T[K];
};

export type FragmentOptions<T extends ValidAttributes> = {
  /** Name for the fragment (For debugging purposes). */
  name: string;
  /** Function that returns the content of the fragment. */
  content: (props: InferAttributesWithSignals<T, true>) => JSX.Element | Promise<JSX.Element>;
  /** Default values for the attributes passed to the fragment. */
  attributes?: InferAttributes<T>; // TODO(@miguelbogota): This needs to be inferred and passed to the content.
  /** Wrapper for the fragment. */
  wrapper?: string;
  /** Function that returns the fallback when the content is async. */
  fallback?: (props: InferAttributesWithSignals<T>) => JSX.Element;
};

export function fragment<const T extends ValidAttributes>(options: FragmentOptions<T>) {
  const contentProps = (passedProps: RemoveComputedAndServer<T>) => {
    const props = {
      ...options.attributes,
      ...passedProps,
    };

    const primitiveProps = Object.entries(props)
      .filter(([, value]) => typeof value !== 'function')
      .map(([key, value]) => [key, signal(value)]);

    const computedAcc = {};

    const computedProps = Object.entries(props)
      .filter(([, value]) => typeof value === 'function')
      .map(([key, value]) => {
        const computed = () => {
          const result = (value as (props: unknown) => unknown)({
            ...primitiveProps,
            ...computedAcc,
          });

          // Check if is not a server value
          if (!(result instanceof Promise)) {
            return result;
          }

          throw new Error('Server values are not supported just yet');
        };

        const fn = signal.memo(computed);
        Object.assign(computedAcc, { [key]: fn });

        return [key, fn];
      });

    return Object.fromEntries([...primitiveProps, ...computedProps]) as InferAttributesWithSignals<
      T,
      true
    >;
  };

  const frag = (props: RemoveComputedAndServer<T>) => {
    return {
      element: options.wrapper ?? options.name,
      name: options.name,
      props,
      children: options.content(contentProps(props)),
    } as JSX.Element;
  };

  markFragment(frag);

  return frag;
}
